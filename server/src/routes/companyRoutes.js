// ============================================================
// CPMS – Company Routes (src/routes/companyRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getAdminDashboardStats,
} = require('../controllers/companyController');

// ── All routes below require authentication ─────────────────
router.use(protect);

// Admin dashboard stats (Admin Only)
router.get('/stats/dashboard', requireRole('TPO_ADMIN'), getAdminDashboardStats);

// List all companies (Students + Admins)
router.get('/', getCompanies);

// Get single company details (Students + Admins)
router.get('/:id', getCompanyById);

// ── Admin-Only CRUD operations ─────────────────────────────
router.post('/', requireRole('TPO_ADMIN'), createCompany);
router.patch('/:id', requireRole('TPO_ADMIN'), updateCompany);
router.delete('/:id', requireRole('TPO_ADMIN'), deleteCompany);

module.exports = router;
