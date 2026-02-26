// ============================================================
// CPMS – Round Routes (src/routes/roundRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    createRound,
    getRoundsForCompany,
    updateStudentStatus,
} = require('../controllers/roundController');

// ── All routes below require authentication ─────────────────
router.use(protect);

// ── Shared (Student & Admin) ────────────────────────────────
// View rounds (dashboard pipelines)
router.get('/company/:companyId', getRoundsForCompany);

// ── Admin-Only CRUD operations ─────────────────────────────
// Add new round to a company
router.post('/company/:companyId', requireRole('TPO_ADMIN'), createRound);

// Update a candidate's pass/fail result in a specific round
router.patch('/:roundId/results', requireRole('TPO_ADMIN'), updateStudentStatus);

module.exports = router;
