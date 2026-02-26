// ============================================================
// CPMS – Company Controller (src/controllers/companyController.js)
// Handles: CRUD for companies + TPO Dashboard aggregations
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

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
    const parsed = companySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const data = { ...parsed.data, driveDate: new Date(parsed.data.driveDate) };

    const company = await prisma.company.create({ data });
    return res.status(201).json({ success: true, message: 'Company created successfully', company });
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

    // Mock AreaChart data (Drive student participation over last 6 months)
    // To keep the demo fast, returning static structured data matching the shape
    const areaChartData = [
        { month: 'Sep', applications: 120 },
        { month: 'Oct', applications: 250 },
        { month: 'Nov', applications: 400 },
        { month: 'Dec', applications: 200 },
        { month: 'Jan', applications: 800 },
        { month: 'Feb', applications: 650 },
    ];

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

module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getAdminDashboardStats,
};
