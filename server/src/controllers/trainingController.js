// ============================================================
// CPMS – Training Controller (src/controllers/trainingController.js)
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Validation Schemas ──────────────────────────────────────
const sessionSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.string().min(1, 'Type is required'), // e.g., 'WORKSHOP', 'SEMINAR', 'TECHNICAL'
    conductedBy: z.string().min(1, 'Conductor name is required'),
    sessionDate: z.string().transform((str) => new Date(str)),
    description: z.string().optional()
});

const attendanceSchema = z.object({
    studentIds: z.array(z.string()).min(1, 'At least one student ID is required'),
});

// ────────────────────────────────────────────────────────────
// GET /api/training  (protected: Any authenticated user)
// ────────────────────────────────────────────────────────────
const getSessions = async (req, res) => {
    try {
        const sessions = await prisma.trainingSession.findMany({
            orderBy: { sessionDate: 'asc' },
            include: {
                _count: {
                    select: { attendances: true }
                }
            }
        });

        // If student, also return their specific attendances to highlight joined sessions
        if (req.user.role === 'STUDENT') {
            const studentRecord = await prisma.student.findUnique({
                where: { userId: req.user.userId },
                select: { id: true }
            });

            if (studentRecord) {
                const studentId = studentRecord.id;
                const myAttendances = await prisma.trainingAttendance.findMany({
                    where: { studentId },
                    select: { sessionId: true, status: true, markedAt: true }
                });

                const attendanceMap = myAttendances.reduce((acc, curr) => {
                    acc[curr.sessionId] = curr;
                    return acc;
                }, {});

                const sessionsWithMyStatus = sessions.map(s => ({
                    ...s,
                    myAttendance: attendanceMap[s.id] || null
                }));

                return res.json({ success: true, sessions: sessionsWithMyStatus });
            }
        }

        return res.json({ success: true, sessions });
    } catch (error) {
        console.error('Error fetching training sessions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// POST /api/training  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const createSession = async (req, res) => {
    try {
        const parsed = sessionSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
        }

        const session = await prisma.trainingSession.create({
            data: parsed.data
        });

        res.status(201).json({ success: true, session });
    } catch (error) {
        console.error('Error creating training session:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// DELETE /api/training/:id  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const deleteSession = async (req, res) => {
    try {
        await prisma.trainingSession.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting training session:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/training/:id/attendance  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const getAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        // ensure session exists
        const session = await prisma.trainingSession.findUnique({ where: { id } });
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const attendances = await prisma.trainingAttendance.findMany({
            where: { sessionId: id },
            include: {
                student: {
                    select: {
                        enrollmentNumber: true,
                        firstName: true,
                        lastName: true,
                        branch: true
                    }
                }
            }
        });

        res.json({ success: true, attendances });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ────────────────────────────────────────────────────────────
// POST /api/training/:id/attendance  (protected: TPO_ADMIN)
// Mark bulk attendance for a session
// ────────────────────────────────────────────────────────────
const markAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const parsed = attendanceSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
        }

        const { studentIds } = parsed.data;

        // Upsert logic for each student (if they are already marked, keep them, or update status)
        // Since sqlite doesn't support createMany with ignore duplicates easily, we iterate.
        // For performance in a huge list, a transaction is best.

        const operations = studentIds.map(studentId => {
            return prisma.trainingAttendance.upsert({
                where: {
                    sessionId_studentId: {
                        sessionId: id,
                        studentId: studentId
                    }
                },
                update: {
                    status: 'PRESENT',
                    markedAt: new Date()
                },
                create: {
                    sessionId: id,
                    studentId: studentId,
                    status: 'PRESENT'
                }
            });
        });

        await prisma.$transaction(operations);

        res.json({ success: true, message: `Successfully marked ${studentIds.length} students as present.` });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// POST /api/training/:id/join  (protected: STUDENT)
// Student self-registering for a workshop
// ────────────────────────────────────────────────────────────
const joinSession = async (req, res) => {
    try {
        const { id } = req.params;
        const studentRecord = await prisma.student.findUnique({
            where: { userId: req.user.userId },
            select: { id: true }
        });
        if (!studentRecord) return res.status(404).json({ success: false, message: 'Student not found' });

        const studentId = studentRecord.id;

        const session = await prisma.trainingSession.findUnique({ where: { id } });
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        // Check if already registered
        const existing = await prisma.trainingAttendance.findUnique({
            where: {
                sessionId_studentId: {
                    sessionId: id,
                    studentId: studentId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already registered for this session' });
        }

        const attendance = await prisma.trainingAttendance.create({
            data: {
                sessionId: id,
                studentId: studentId,
                status: 'REGISTERED' // Default status before Admin marks PRESENT
            }
        });

        res.status(201).json({ success: true, attendance });
    } catch (error) {
        console.error('Error joining session:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


module.exports = {
    getSessions,
    createSession,
    deleteSession,
    getAttendance,
    markAttendance,
    joinSession
};
