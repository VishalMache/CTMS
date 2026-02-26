// ============================================================
// CPMS – Drive Controller (src/controllers/driveController.js)
// Handles: Student registration logic + TPO viewing registered students
// ============================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── Helper: Resolve current student id from JWT userId ─────
const getStudentId = async (userId) => {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
    });
    return student?.id ?? null;
};

// ────────────────────────────────────────────────────────────
// POST /api/drives/:companyId/register  (protected: STUDENT)
// ────────────────────────────────────────────────────────────
const registerForDrive = async (req, res) => {
    const { companyId } = req.params;
    const userId = req.user.userId;

    // 1. Get full Student Profile
    const student = await prisma.student.findUnique({
        where: { userId },
    });
    if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // 2. Get Company Requirements
    const company = await prisma.company.findUnique({
        where: { id: companyId }
    });
    if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // 3. Check if already registered
    const existing = await prisma.driveRegistration.findUnique({
        where: {
            companyId_studentId: {
                companyId,
                studentId: student.id,
            }
        }
    });
    if (existing) {
        return res.status(400).json({ success: false, message: 'You are already registered for this drive.' });
    }

    // 4. ELIGIBILITY LOGIC
    const reasons = [];

    // a. CGPA check
    if (student.cgpa < company.eligibilityCGPA) {
        reasons.push(`Minimum CGPA required is ${company.eligibilityCGPA}, you have ${student.cgpa}.`);
    }

    // b. 10th / 12th Percent check (picking minimum required)
    if (student.tenth_percent < company.eligibilityPercent || student.twelfth_percent < company.eligibilityPercent) {
        reasons.push(`Minimum 10th/12th percentage required is ${company.eligibilityPercent}%.`);
    }

    // c. Active Backlogs check (strict - NO active backlogs allowed)
    if (student.activeBacklogs) {
        reasons.push('Active backlogs are not allowed for this drive.');
    }

    // d. Allowed Branches check (CSV array)
    // company.allowedBranches is string like "CSE,IT,ECE"
    const branches = company.allowedBranches.split(',').map(b => b.trim().toUpperCase());
    if (!branches.includes(student.branch.toUpperCase())) {
        reasons.push(`Your branch (${student.branch}) is not eligible. Allowed: ${company.allowedBranches}.`);
    }

    // 5. Result
    const isEligible = reasons.length === 0;

    if (!isEligible) {
        return res.status(400).json({
            success: false,
            message: 'You are not eligible for this drive.',
            reasons,
        });
    }

    // 6. Register
    const registration = await prisma.driveRegistration.create({
        data: {
            companyId,
            studentId: student.id,
            isEligible: true, // Only creating records for eligible students based on the flow design
        }
    });

    return res.status(201).json({
        success: true,
        message: 'Successfully registered for the drive.',
        registration,
    });
};

// ────────────────────────────────────────────────────────────
// GET /api/drives/:companyId/students  (protected: TPO_ADMIN)
// TPOs returning a list of all students participating in a drive
// ────────────────────────────────────────────────────────────
const getRegisteredStudents = async (req, res) => {
    const { companyId } = req.params;

    const registrations = await prisma.driveRegistration.findMany({
        where: { companyId },
        include: {
            student: {
                include: {
                    user: { select: { email: true } }
                }
            }
        },
        orderBy: { registeredAt: 'desc' }
    });

    // Flatten it for the frontend
    const students = registrations.map(reg => ({
        ...reg.student,
        email: reg.student.user.email,
        registrationId: reg.id,
        registeredAt: reg.registeredAt,
    }));

    return res.json({ success: true, count: students.length, students });
};

module.exports = {
    registerForDrive,
    getRegisteredStudents,
};
