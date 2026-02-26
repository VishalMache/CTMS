// ============================================================
// CPMS – Student Controller (src/controllers/studentController.js)
// Handles: profile fetch, profile update, resume upload,
//          photo upload, and quick stats aggregation
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Zod: profile update schema ──────────────────────────────
const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
    gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
    hasInternship: z.boolean().optional(),
    internshipDetails: z.string().max(500).optional().or(z.literal('')),
});

// ────────────────────────────────────────────────────────────
// GET /api/students/profile  (protected: STUDENT)
// Returns full student profile + user email
// ────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
    const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
        include: {
            user: {
                select: { id: true, email: true, role: true, createdAt: true },
            },
        },
    });

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    return res.json({ success: true, student });
};

// ────────────────────────────────────────────────────────────
// PATCH /api/students/profile  (protected: STUDENT)
// Update personal editable fields only
// ────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    // Remove empty strings so they don't overwrite real data
    const data = Object.fromEntries(
        Object.entries(parsed.data).filter(([, v]) => v !== '' && v !== undefined)
    );

    const student = await prisma.student.update({
        where: { userId: req.user.userId },
        data,
    });

    return res.json({ success: true, message: 'Profile updated successfully', student });
};

// ────────────────────────────────────────────────────────────
// POST /api/students/resume  (protected: STUDENT)
// Multer + Cloudinary handles the upload; we just save the URL
// ────────────────────────────────────────────────────────────
const uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Cloudinary URL is on req.file.path
    const resumeUrl = req.file.path;

    const student = await prisma.student.update({
        where: { userId: req.user.userId },
        data: { resumeUrl },
    });

    return res.json({
        success: true,
        message: 'Resume uploaded successfully',
        resumeUrl: student.resumeUrl,
    });
};

// ────────────────────────────────────────────────────────────
// POST /api/students/photo  (protected: STUDENT)
// Upload profile photo → save URL
// ────────────────────────────────────────────────────────────
const uploadPhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const profilePhotoUrl = req.file.path;

    const student = await prisma.student.update({
        where: { userId: req.user.userId },
        data: { profilePhotoUrl },
    });

    return res.json({
        success: true,
        message: 'Profile photo updated',
        profilePhotoUrl: student.profilePhotoUrl,
    });
};

// ────────────────────────────────────────────────────────────
// GET /api/students/stats  (protected: STUDENT)
// Aggregated quick stats for the dashboard
// ────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
    const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
        select: { id: true },
    });

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentId = student.id;

    // Run all aggregations in parallel
    const [
        applicationsCount,
        pendingRoundsCount,
        mockResults,
        totalAttendance,
        presentAttendance,
    ] = await Promise.all([
        // Total drive registrations
        prisma.driveRegistration.count({ where: { studentId } }),

        // Active round invites (rounds where result is PENDING)
        prisma.roundResult.count({ where: { studentId, status: 'PENDING' } }),

        // All mock test results for average score percentage
        prisma.mockTestResult.findMany({
            where: { studentId },
            select: { score: true, totalMarks: true },
        }),

        // Total training attendance records
        prisma.trainingAttendance.count({ where: { studentId } }),

        // Records where student was present
        prisma.trainingAttendance.count({ where: { studentId, status: 'PRESENT' } }),
    ]);

    // Calculate mock test average as percentage
    let avgMockScore = 0;
    if (mockResults.length > 0) {
        const totalPct = mockResults.reduce((acc, r) => acc + (r.score / r.totalMarks) * 100, 0);
        avgMockScore = Math.round(totalPct / mockResults.length);
    }

    // Calculate attendance percentage
    const attendancePct = totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0;

    return res.json({
        success: true,
        stats: {
            applicationsCount,
            pendingRoundsCount,
            avgMockScore,
            attendancePct,
            mockTestsAttempted: mockResults.length,
        },
    });
};

// ────────────────────────────────────────────────────────────
// GET /api/students/applications  (protected: STUDENT)
// Drive registrations with company info + latest round status
// ────────────────────────────────────────────────────────────
const getApplications = async (req, res) => {
    const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
        select: { id: true },
    });

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const applications = await prisma.driveRegistration.findMany({
        where: { studentId: student.id },
        include: {
            company: {
                include: {
                    selectionRounds: {
                        orderBy: { roundNumber: 'asc' },
                        include: {
                            roundResults: {
                                where: { studentId: student.id },
                                select: { status: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { registeredAt: 'desc' },
    });

    return res.json({ success: true, applications });
};

// ────────────────────────────────────────────────────────────
// GET /api/students/all  (protected: TPO_ADMIN)
// Fetch all registered students for the admin ledger
// ────────────────────────────────────────────────────────────
const getAllStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                user: { select: { email: true } },
                roundResults: {
                    select: { status: true },
                    where: { status: 'SELECTED' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, students });
    } catch (error) {
        console.error('Error fetching all students:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getProfile, updateProfile, uploadResume, uploadPhoto, getStats, getApplications, getAllStudents };
