// ============================================================
// CPMS – Company Controller (src/controllers/companyController.js)
// Handles: CRUD for companies + TPO Dashboard aggregations
// ============================================================

const prisma = require('../lib/prisma');
const { z } = require('zod');

// ── Zod: Create/Update Company Schema ────────────────────────
const companySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    jobRole: z.string().min(1, 'Job role is required'),
    ctc: z.coerce.number().min(0, 'CTC must be positive'),
    eligibilityCGPA: z.coerce.number().min(0).max(10, 'CGPA must be between 0 and 10'),
    eligibilityPercent: z.coerce.number().min(0).max(100, 'Percent must be between 0 and 100'),
    // Note: SQLite doesn't support arrays, so we store allowedBranches as a comma-separated string
    allowedBranches: z.string().min(1, 'At least one branch must be allowed'),
    driveDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date string' }),
    description: z.string().optional(),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).optional().default('UPCOMING'),
});

// ────────────────────────────────────────────────────────────
// POST /api/companies  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const createCompany = async (req, res) => {
    try {
        const parsed = companySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = { ...parsed.data, driveDate: new Date(parsed.data.driveDate) };

        // Convert comma-separated branches string to array for PostgreSQL
        if (typeof data.allowedBranches === 'string') {
            data.allowedBranches = data.allowedBranches.split(',').map(b => b.trim()).filter(Boolean);
        }

        const company = await prisma.company.create({ data });
        return res.status(201).json({ success: true, message: 'Company created successfully', company });
    } catch (error) {
        console.error('Error creating company:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/companies  (protected: STUDENT or TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const getCompanies = async (req, res) => {
    // TPOs see everything. Students only see ACTIVE or UPCOMING
    const filters = req.user.role === 'STUDENT'
        ? { status: { in: ['UPCOMING', 'ACTIVE'] } }
        : {};

    const companies = await prisma.company.findMany({
        where: filters,
        orderBy: { driveDate: 'asc' },
    });
    return res.json({ success: true, companies });
};

// ────────────────────────────────────────────────────────────
// GET /api/companies/:id  (protected: STUDENT or TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const getCompanyById = async (req, res) => {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            selectionRounds: { orderBy: { roundNumber: 'asc' } },
        }
    });

    if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
    }

    return res.json({ success: true, company });
};

// ────────────────────────────────────────────────────────────
// PATCH /api/companies/:id  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const updateCompany = async (req, res) => {
    const { id } = req.params;

    // Check existence
    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Partial validation
    const parsed = companySchema.partial().safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const data = { ...parsed.data };
    if (data.driveDate) data.driveDate = new Date(data.driveDate);
    // Convert comma-separated branches string to array for PostgreSQL
    if (typeof data.allowedBranches === 'string') {
        data.allowedBranches = data.allowedBranches.split(',').map(b => b.trim()).filter(Boolean);
    }

    const company = await prisma.company.update({
        where: { id },
        data,
    });

    return res.json({ success: true, message: 'Company updated', company });
};

// ────────────────────────────────────────────────────────────
// DELETE /api/companies/:id  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
const deleteCompany = async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await prisma.company.delete({ where: { id } });
    return res.json({ success: true, message: 'Company deleted' });
};

// ────────────────────────────────────────────────────────────
// GET /api/companies/stats/dashboard  (protected: TPO_ADMIN)
// Precomputes TPO Top Stats + Recharts Data
// ────────────────────────────────────────────────────────────
const getAdminDashboardStats = async (req, res) => {
    const [
        totalCompanies,
        totalStudents,
        upcomingDrives,
        placedStudentsCount,
        branchPlacements,
    ] = await Promise.all([
        prisma.company.count(),
        prisma.student.count(),
        prisma.company.count({ where: { status: 'UPCOMING' } }),

        // A student is placed if they have a 'SELECTED' result in ANY round (oversimplified logic for Ph3; 
        // Ph4 will refine this so they must be SELECTED in the FINAL round).
        // For distinct count in SQLite:
        prisma.roundResult.findMany({
            where: { status: 'SELECTED' },
            select: { studentId: true },
            distinct: ['studentId'],
        }).then(res => res.length),

        // Branch-wise placements (Raw aggregation for Recharts PieChart)
        // Since Prisma doesn't do complex grouping easily across nested relations in SQLite, we fetch the 
        // student profiles of those selected and group them in-memory. This is fine for a college-sized DB.
        prisma.roundResult.findMany({
            where: { status: 'SELECTED' },
            distinct: ['studentId'],
            include: { student: { select: { branch: true } } },
        })
    ]);

    // Group branch placements for the PieChart
    // e.g., -> [ { name: 'CSE', value: 40 }, { name: 'IT', value: 20 } ]
    const branchMap = {};
    branchPlacements.forEach(result => {
        const branch = result.student?.branch;
        if (branch) {
            branchMap[branch] = (branchMap[branch] || 0) + 1;
        }
    });

    const pieChartData = Object.keys(branchMap).map(branch => ({
        name: branch,
        value: branchMap[branch]
    }));

    // Real AreaChart data: Drive registrations grouped by month over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentRegistrations = await prisma.driveRegistration.findMany({
        where: { registeredAt: { gte: sixMonthsAgo } },
        select: { registeredAt: true },
    });

    // Build month buckets
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const areaChartData = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        areaChartData.push({ month: monthNames[d.getMonth()], applications: 0 });
    }
    recentRegistrations.forEach(reg => {
        const regMonth = new Date(reg.registeredAt).getMonth();
        const entry = areaChartData.find(e => e.month === monthNames[regMonth]);
        if (entry) entry.applications++;
    });

    const placementPercentage = totalStudents > 0
        ? Math.round((placedStudentsCount / totalStudents) * 100)
        : 0;

    return res.json({
        success: true,
        stats: {
            totalCompanies,
            activeStudents: totalStudents,
            placementPercentage,
            upcomingDrives,
        },
        charts: {
            pieChartData,
            areaChartData,
        }
    });
};

// ────────────────────────────────────────────────────────────
// GET /api/companies/applications/all  (protected: TPO_ADMIN)
// Returns all drive registrations grouped for admin view
// ────────────────────────────────────────────────────────────
const getStudentApplications = async (req, res) => {
    try {
        const registrations = await prisma.driveRegistration.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        enrollmentNumber: true,
                        branch: true,
                        cgpa: true,
                        user: { select: { email: true } }
                    }
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                        jobRole: true,
                        ctc: true,
                        status: true,
                    }
                }
            },
            orderBy: { registeredAt: 'desc' }
        });

        return res.json({ success: true, applications: registrations });
    } catch (error) {
        console.error('Error fetching student applications:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getAdminDashboardStats,
    getStudentApplications,
};
