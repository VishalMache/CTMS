// ============================================================
// CPMS – Report Controller (src/controllers/reportController.js)
// ============================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────
// GET /api/reports/dashboard-stats
// High-level KPIs: Total Students, Placed, Avg CTC, Highest CTC
// ────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Registered Students
        const totalStudents = await prisma.student.count();

        // 2. Total Placed (Distinct students with a SELECTED round result)
        // Since a student might be selected in multiple companies (if policy allows), we count distinct.
        // In sqlite, prisma distinct count is limited, so we fetch group by or raw.
        const placedStudents = await prisma.roundResult.findMany({
            where: { status: 'SELECTED' },
            distinct: ['studentId'],
            select: { studentId: true }
        });
        const totalPlaced = placedStudents.length;

        // 3. CTC Metrics (Avg and Highest)
        // We only consider the CTC of companies where students were actually SELECTED.
        // Because a company might offer 10LPA but no one got selected. We want actual achieved CTC data.

        const selections = await prisma.roundResult.findMany({
            where: { status: 'SELECTED' },
            include: {
                round: {
                    include: { company: true }
                }
            }
        });

        let highestCTC = 0;
        let totalCTC = 0;
        let validOffersCount = 0;

        selections.forEach(sel => {
            const ctc = sel.round?.company?.ctc;
            if (ctc) {
                if (ctc > highestCTC) highestCTC = ctc;
                totalCTC += ctc;
                validOffersCount++;
            }
        });

        const avgCTC = validOffersCount > 0 ? (totalCTC / validOffersCount).toFixed(2) : 0;

        res.json({
            success: true,
            stats: {
                totalStudents,
                totalPlaced,
                placementRate: totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : 0,
                highestCTC,
                avgCTC: parseFloat(avgCTC)
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/reports/branch-placements
// Returns: [{ name: 'CSE', value: 45 }, { name: 'IT', value: 30 }]
// ────────────────────────────────────────────────────────────
const getBranchPlacements = async (req, res) => {
    try {
        // We need students who have AT LEAST ONE 'SELECTED' record
        const studentsWithOffers = await prisma.student.findMany({
            where: {
                roundResults: {
                    some: { status: 'SELECTED' }
                }
            },
            select: { branch: true }
        });

        // Aggregate locally
        const branchCounts = {};
        studentsWithOffers.forEach(s => {
            branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
        });

        // Format for Recharts PieChart/BarChart
        const data = Object.keys(branchCounts).map(branch => ({
            name: branch,
            value: branchCounts[branch]
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching branch placements:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/reports/company-selections
// Returns: [{ name: 'Google', value: 12 }, { name: 'TCS', value: 45 }]
// ────────────────────────────────────────────────────────────
const getCompanySelections = async (req, res) => {
    try {
        const selections = await prisma.roundResult.findMany({
            where: { status: 'SELECTED' },
            include: {
                round: {
                    include: { company: { select: { name: true } } }
                }
            }
        });

        const companyCounts = {};
        selections.forEach(sel => {
            const cName = sel.round?.company?.name;
            if (cName) {
                companyCounts[cName] = (companyCounts[cName] || 0) + 1;
            }
        });

        const data = Object.keys(companyCounts).map(company => ({
            name: company,
            value: companyCounts[company]
        })).sort((a, b) => b.value - a.value); // sort highest first

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching company selections:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/reports/export-students
// Generates raw JSON representing CSV rows for all students + placed company
// ────────────────────────────────────────────────────────────
const exportStudentData = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                user: { select: { email: true } },
                roundResults: {
                    where: { status: 'SELECTED' },
                    include: {
                        round: {
                            include: { company: true }
                        }
                    }
                }
            },
            orderBy: { enrollmentNumber: 'asc' }
        });

        const csvData = students.map(s => {
            // A student might have multiple offers. We'll join them by comma for the CSV cell.
            const offers = s.roundResults.map(r => r.round.company.name).join(' | ');
            const totalOffers = s.roundResults.length;
            const highestOfferCTC = totalOffers > 0
                ? Math.max(...s.roundResults.map(r => r.round.company.ctc))
                : 0;

            return {
                Enrollment_Number: s.enrollmentNumber,
                First_Name: s.firstName,
                Last_Name: s.lastName,
                Email: s.user?.email || '',
                Phone: s.phone || '',
                Gender: s.gender || '',
                Branch: s.branch,
                CGPA: s.cgpa,
                Tenth_Percent: s.tenth_percent,
                Twelfth_Percent: s.twelfth_percent,
                Active_Backlogs: s.activeBacklogs ? 'YES' : 'NO',
                Total_Offers: totalOffers,
                Companies_Selected: offers || 'Unplaced',
                Highest_CTC_Secured: highestOfferCTC
            };
        });

        res.json({ success: true, data: csvData });
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getDashboardStats,
    getBranchPlacements,
    getCompanySelections,
    exportStudentData
};
