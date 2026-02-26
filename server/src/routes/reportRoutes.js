// ============================================================
// CPMS – Report Routes (src/routes/reportRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    getDashboardStats,
    getBranchPlacements,
    getCompanySelections,
    exportStudentData
} = require('../controllers/reportController');

// All reports are hyper-sensitive TPO Admin data only
router.use(protect);
router.use(requireRole('TPO_ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/branch-placements', getBranchPlacements);
router.get('/company-selections', getCompanySelections);
router.get('/export-students', exportStudentData);

module.exports = router;
