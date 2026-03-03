// ============================================================
// CPMS – Round Controller (src/controllers/roundController.js)
// Handles: Creating selection rounds & updating student results
// ============================================================

const prisma = require('../lib/prisma');
const { z } = require('zod');

// ── Validation helpers (Zod v4 compatible) ──────────────────
const validateCreateRound = (body) => {
    const errors = {};
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        errors.name = 'Round name is required';
    }
    if (!body.roundNumber || !Number.isInteger(body.roundNumber) || body.roundNumber < 1) {
        errors.roundNumber = 'Round number must be a positive integer';
    }
    if (!body.date || isNaN(Date.parse(body.date))) {
        errors.date = 'Valid date is required';
    }
    return {
        success: Object.keys(errors).length === 0,
        data: { name: body.name, roundNumber: body.roundNumber, date: body.date, description: body.description || '' },
        errors
    };
};

const validateUpdateResult = (body) => {
    const errors = {};
    if (!body.studentId || typeof body.studentId !== 'string' || body.studentId.trim().length === 0) {
        errors.studentId = 'Student ID is required';
    }
    if (!['PENDING', 'SELECTED', 'REJECTED'].includes(body.status)) {
        errors.status = 'Status must be PENDING, SELECTED, or REJECTED';
    }
    return {
        success: Object.keys(errors).length === 0,
        data: { studentId: body.studentId, status: body.status, feedback: body.feedback || undefined },
        errors
    };
};

// ────────────────────────────────────────────────────────────
// POST /api/rounds/company/:companyId  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const createRound = async (req, res) => {
    const { companyId } = req.params;

    // Validate Company
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // Validate Input
    const parsed = validateCreateRound(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.errors });
    }

    const { name, roundNumber, date, description } = parsed.data;

    // Check if round number exists
    const existingRound = await prisma.selectionRound.findFirst({
        where: { companyId, roundNumber }
    });
    if (existingRound) {
        return res.status(400).json({ success: false, message: `Round number ${roundNumber} already exists for this company.` });
    }

    // Create Round
    const newRound = await prisma.selectionRound.create({
        data: {
            companyId,
            name,
            roundNumber,
            date: new Date(date),
            description,
        }
    });

    // Seed students into this round who are eligible!
    // If it's Round 1, seed all registered students.
    // If it's Round N > 1, seed only students who were SELECTED in Round (N-1).
    let eligibleStudents = [];

    if (roundNumber === 1) {
        // Find all students registered for this drive
        const registrations = await prisma.driveRegistration.findMany({
            where: { companyId },
            select: { studentId: true }
        });
        eligibleStudents = registrations.map(reg => reg.studentId);
    } else {
        // Find students SELECTED in the previous round
        const previousRound = await prisma.selectionRound.findFirst({
            where: { companyId, roundNumber: roundNumber - 1 },
            select: { id: true }
        });

        if (previousRound) {
            const passedResults = await prisma.roundResult.findMany({
                where: { roundId: previousRound.id, status: 'SELECTED' },
                select: { studentId: true }
            });
            eligibleStudents = passedResults.map(r => r.studentId);
        }
    }

    // Bulk create pending results for eligible students
    if (eligibleStudents.length > 0) {
        const resultsData = eligibleStudents.map(studentId => ({
            roundId: newRound.id,
            studentId,
            status: 'PENDING'
        }));
        await prisma.roundResult.createMany({ data: resultsData });
    }

    return res.status(201).json({
        success: true,
        message: 'Round created and eligible students assigned',
        round: newRound
    });
};

// ────────────────────────────────────────────────────────────
// GET /api/rounds/company/:companyId  (protected: STUDENT or TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const getRoundsForCompany = async (req, res) => {
    const { companyId } = req.params;

    // Fetch rounds ordered sequentially
    const rounds = await prisma.selectionRound.findMany({
        where: { companyId },
        orderBy: { roundNumber: 'asc' },
        include: {
            results: {
                include: {
                    student: {
                        include: { user: { select: { email: true } } }
                    }
                }
            }
        }
    });

    // Formatting it nicely for frontend consumption
    const formattedRounds = rounds.map(r => ({
        id: r.id,
        name: r.name,
        roundNumber: r.roundNumber,
        date: r.date,
        description: r.description,
        candidates: r.results.map(res => ({
            resultId: res.id,
            studentId: res.student.id,
            name: `${res.student.firstName} ${res.student.lastName}`,
            email: res.student.user.email,
            branch: res.student.branch,
            status: res.status,
            feedback: res.feedback,
            updatedAt: res.updatedAt
        }))
    }));

    return res.json({ success: true, count: formattedRounds.length, rounds: formattedRounds });
};

// ────────────────────────────────────────────────────────────
// PATCH /api/rounds/:roundId/results  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const updateStudentStatus = async (req, res) => {
    try {
        const { roundId } = req.params;

        // Validate Input
        const parsed = validateUpdateResult(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.errors });
        }

        const { studentId, status, feedback } = parsed.data;

        // Ensure the round exists
        const round = await prisma.selectionRound.findUnique({ where: { id: roundId } });
        if (!round) return res.status(404).json({ success: false, message: 'Round not found' });

        // Update or Create the specific result
        const resultRecord = await prisma.roundResult.upsert({
            where: {
                roundId_studentId: { roundId, studentId }
            },
            update: { status, feedback },
            create: { roundId, studentId, status, feedback },
        });

        // ── Auto-seed into next round when SELECTED ──
        // If student is SELECTED, check if a next round exists and seed them in
        if (status === 'SELECTED') {
            const nextRound = await prisma.selectionRound.findFirst({
                where: { companyId: round.companyId, roundNumber: round.roundNumber + 1 }
            });

            if (nextRound) {
                // Check if student already has a result in the next round
                const existingNextResult = await prisma.roundResult.findUnique({
                    where: { roundId_studentId: { roundId: nextRound.id, studentId } }
                });

                if (!existingNextResult) {
                    await prisma.roundResult.create({
                        data: { roundId: nextRound.id, studentId, status: 'PENDING' }
                    });
                    console.log(`[ROUND] Auto-seeded student ${studentId} into round ${nextRound.roundNumber} (${nextRound.name})`);
                }
            }
        }

        // ── Remove from next round when REJECTED ──
        // If student is REJECTED, remove their PENDING result from the next round (if any)
        if (status === 'REJECTED') {
            const nextRound = await prisma.selectionRound.findFirst({
                where: { companyId: round.companyId, roundNumber: round.roundNumber + 1 }
            });

            if (nextRound) {
                await prisma.roundResult.deleteMany({
                    where: { roundId: nextRound.id, studentId, status: 'PENDING' }
                });
            }
        }

        console.log(`[ROUND] Updated student ${studentId} in round ${roundId}: ${status}`);
        return res.json({
            success: true,
            message: `Candidate marked as ${status}`,
            result: resultRecord
        });
    } catch (error) {
        console.error('[ROUND] Update error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

module.exports = {
    createRound,
    getRoundsForCompany,
    updateStudentStatus,
};
