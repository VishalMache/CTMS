// ============================================================
// CPMS – Round Controller (src/controllers/roundController.js)
// Handles: Creating selection rounds & updating student results
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Zod Schemas ─────────────────────────────────────────────
const createRoundSchema = z.object({
    name: z.string().min(1, 'Round name is required'),
    roundNumber: z.number().int().min(1, 'Round number must be at least 1'),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date string' }),
    description: z.string().optional(),
});

const updateResultSchema = z.object({
    studentId: z.string().uuid('Invalid Student ID'),
    status: z.enum(['PENDING', 'SELECTED', 'REJECTED']),
    feedback: z.string().optional(),
});

// ────────────────────────────────────────────────────────────
// POST /api/rounds/company/:companyId  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const createRound = async (req, res) => {
    const { companyId } = req.params;

    // Validate Company
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // Validate Input
    const parsed = createRoundSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
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
                        include: { user: { select: { firstName: true, lastName: true, email: true } } }
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
            name: `${res.student.user.firstName} ${res.student.user.lastName}`,
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
    const { roundId } = req.params;

    // Validate Input
    const parsed = updateResultSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
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

    return res.json({
        success: true,
        message: `Candidate marked as ${status}`,
        result: resultRecord
    });
};

module.exports = {
    createRound,
    getRoundsForCompany,
    updateStudentStatus,
};
