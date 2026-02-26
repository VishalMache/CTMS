// ============================================================
// CPMS – Mock Test Controller (src/controllers/mockTestController.js)
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Validation Schemas ──────────────────────────────────────
const testSchema = z.object({
    title: z.string().min(1, 'Title needed'),
    type: z.enum(['TECHNICAL', 'APTITUDE', 'CODING', 'HR']),
    duration: z.number().int().min(1, 'Duration must be > 0'), // in minutes
    totalMarks: z.number().int().min(1),
    isActive: z.boolean().default(false)
});

const questionSchema = z.object({
    testId: z.string(),
    questionText: z.string().min(1),
    optionA: z.string().min(1),
    optionB: z.string().min(1),
    optionC: z.string().min(1),
    optionD: z.string().min(1),
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    marks: z.number().int().default(1),
    subject: z.string().optional()
});

const submissionSchema = z.object({
    answers: z.record(z.enum(['A', 'B', 'C', 'D'])) // Record<QuestionId, Selection>
});


// ────────────────────────────────────────────────────────────
// GET /api/mock-tests
// ────────────────────────────────────────────────────────────
const getTests = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'TPO_ADMIN';

        const tests = await prisma.mockTest.findMany({
            where: isAdmin ? undefined : { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { questions: true } },
                questions: isAdmin ? true : false // Dont send answers unless Admin (or inside quiz attempt logic)
            }
        });

        // If student, attach prior results so they know if they took it already
        if (!isAdmin) {
            // Need to lookup the actual studentId from the user's ID
            const studentRecord = await prisma.student.findUnique({
                where: { userId: req.user.userId },
                select: { id: true }
            });

            if (studentRecord) {
                const results = await prisma.mockTestResult.findMany({
                    where: { studentId: studentRecord.id },
                    select: { testId: true, score: true, attemptedAt: true }
                });

                const resultMap = results.reduce((acc, curr) => {
                    acc[curr.testId] = curr;
                    return acc;
                }, {});

                const testsWithStatus = tests.map(t => ({
                    ...t,
                    myResult: resultMap[t.id] || null
                }));

                return res.json({ success: true, tests: testsWithStatus });
            }
        }

        res.json({ success: true, tests });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// POST /api/mock-tests   (TPO)
// ────────────────────────────────────────────────────────────
const createTest = async (req, res) => {
    try {
        const parsed = testSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });

        const test = await prisma.mockTest.create({ data: parsed.data });
        res.status(201).json({ success: true, test });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// PATCH /api/mock-tests/:id/toggle  (TPO)
// ────────────────────────────────────────────────────────────
const toggleTestStatus = async (req, res) => {
    try {
        const test = await prisma.mockTest.findUnique({ where: { id: req.params.id } });
        const updated = await prisma.mockTest.update({
            where: { id: req.params.id },
            data: { isActive: !test.isActive }
        });
        res.json({ success: true, isActive: updated.isActive });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// DELETE /api/mock-tests/:id  (TPO)
// ────────────────────────────────────────────────────────────
const deleteTest = async (req, res) => {
    try {
        await prisma.mockTest.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ────────────────────────────────────────────────────────────
// POST /api/mock-tests/:id/questions   (TPO)
// ────────────────────────────────────────────────────────────
const addQuestion = async (req, res) => {
    try {
        const parsed = questionSchema.safeParse({ ...req.body, testId: req.params.id });
        if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });

        const question = await prisma.mockTestQuestion.create({ data: parsed.data });
        res.status(201).json({ success: true, question });
    } catch (error) {
        console.error('Error adding Q:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        await prisma.mockTestQuestion.delete({ where: { id: req.params.questionId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// ────────────────────────────────────────────────────────────
// GET /api/mock-tests/:id/take   (STUDENT)
// Fetches the test questions WITHOUT the correct answers
// ────────────────────────────────────────────────────────────
const takeTest = async (req, res) => {
    try {
        const test = await prisma.mockTest.findUnique({
            where: { id: req.params.id, isActive: true },
            include: {
                questions: {
                    select: {
                        id: true,
                        questionText: true,
                        optionA: true,
                        optionB: true,
                        optionC: true,
                        optionD: true,
                        marks: true,
                        subject: true
                    }
                    // Deliberately excluding 'correctOption'
                }
            }
        });

        if (!test) return res.status(404).json({ success: false, message: 'Test not found or inactive' });

        res.json({ success: true, test });
    } catch (error) {
        console.error('Take Test Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// POST /api/mock-tests/:id/submit   (STUDENT)
// ────────────────────────────────────────────────────────────
const submitTest = async (req, res) => {
    try {
        const parsed = submissionSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });

        const studentRecord = await prisma.student.findUnique({
            where: { userId: req.user.userId },
            select: { id: true }
        });
        if (!studentRecord) return res.status(404).json({ success: false, message: 'Student not found' });

        const studentId = studentRecord.id;
        const testId = req.params.id;
        const { answers } = parsed.data;

        // Check if already attempted
        const existing = await prisma.mockTestResult.findUnique({
            where: { testId_studentId: { testId, studentId } }
        });
        if (existing) return res.status(400).json({ success: false, message: 'Test already submitted' });

        // Evaluate
        const questions = await prisma.mockTestQuestion.findMany({ where: { testId } });

        let score = 0;
        let correctAnswers = 0;
        let wrongAnswers = 0;

        questions.forEach(q => {
            const studentAnswer = answers[q.id];
            if (!studentAnswer) {
                // Not attempted
            } else if (studentAnswer === q.correctOption) {
                score += q.marks;
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        });

        const test = await prisma.mockTest.findUnique({ where: { id: testId } });

        // Save Result
        const result = await prisma.mockTestResult.create({
            data: {
                testId,
                studentId,
                score,
                totalMarks: test.totalMarks,
                timeTaken: 0, // In real world you'd calculate start-end interval
                correctAnswers,
                wrongAnswers
            }
        });

        res.json({ success: true, result });
    } catch (error) {
        console.error('Submit Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/mock-tests/:id/results  (TPO)
// See everyone's score for a specific test
// ────────────────────────────────────────────────────────────
const getTestResults = async (req, res) => {
    try {
        const results = await prisma.mockTestResult.findMany({
            where: { testId: req.params.id },
            include: {
                student: {
                    select: { firstName: true, lastName: true, enrollmentNumber: true, branch: true }
                }
            },
            orderBy: { score: 'desc' }
        });

        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


module.exports = {
    getTests,
    createTest,
    toggleTestStatus,
    deleteTest,
    addQuestion,
    deleteQuestion,
    takeTest,
    submitTest,
    getTestResults
};
