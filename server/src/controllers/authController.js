// ============================================================
// CPMS – Auth Controller (src/controllers/authController.js)
// Handles: register, login, getMe
// ============================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Zod validation schemas ──────────────────────────────────

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'TPO_ADMIN']).optional().default('STUDENT'),
    // Student-specific fields (required when role = STUDENT)
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    enrollmentNumber: z.string().min(1).optional(),
    branch: z.enum(['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EE']).optional(),
    tenth_percent: z.coerce.number().min(0).max(100).optional(),
    twelfth_percent: z.coerce.number().min(0).max(100).optional(),
    cgpa: z.coerce.number().min(0).max(10).optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['STUDENT', 'TPO_ADMIN']),
});

// ── Utility: generate signed JWT ───────────────────────────
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
const register = async (req, res) => {
    // 1. Validate request body
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const {
        email, password, role,
        firstName, lastName, enrollmentNumber,
        branch, tenth_percent, twelfth_percent, cgpa,
    } = parsed.data;

    // 2. For STUDENT role, require extra fields
    if (role === 'STUDENT') {
        if (!firstName || !lastName || !enrollmentNumber || !branch ||
            tenth_percent === undefined || twelfth_percent === undefined || cgpa === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Student fields (firstName, lastName, enrollmentNumber, branch, tenth_percent, twelfth_percent, cgpa) are required',
            });
        }
    }

    // 3. Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create User (and Student profile in a transaction)
    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: { email, password: hashedPassword, role },
        });

        // For student role, auto-create Student profile
        if (role === 'STUDENT') {
            // Check enrollment number uniqueness
            const existingStudent = await tx.student.findUnique({
                where: { enrollmentNumber },
            });
            if (existingStudent) {
                throw Object.assign(new Error('Enrollment number already exists'), { status: 409 });
            }

            await tx.student.create({
                data: {
                    userId: newUser.id,
                    firstName,
                    lastName,
                    enrollmentNumber,
                    branch,
                    tenth_percent,
                    twelfth_percent,
                    cgpa,
                },
            });
        }

        return newUser;
    });

    // 6. Generate token
    const token = generateToken(user.id, user.role);

    return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────
const login = async (req, res) => {
    // 1. Validate
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const { email, password, role } = parsed.data;

    // 2. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Strict Role Validation
    if (user.role !== role) {
        return res.status(403).json({
            success: false,
            message: `Access Denied: Attempted to log in as ${role}, but account is registered as ${user.role}.`
        });
    }

    // 4. Generate token
    const token = generateToken(user.id, user.role);

    return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
};

// ────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    // req.user is populated by authMiddleware
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    gender: true,
                    enrollmentNumber: true,
                    branch: true,
                    tenth_percent: true,
                    twelfth_percent: true,
                    cgpa: true,
                    activeBacklogs: true,
                    totalBacklogs: true,
                    resumeUrl: true,
                    profilePhotoUrl: true,
                    hasInternship: true,
                    internshipDetails: true,
                },
            },
        },
    });

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
};

module.exports = { register, login, getMe };
