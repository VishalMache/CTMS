// ============================================================
// CPMS – Drive Routes (src/routes/driveRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    registerForDrive,
    getRegisteredStudents,
} = require('../controllers/driveController');

// ── All routes below require authentication ─────────────────
router.use(protect);

// Student applying for a drive
router.post('/:companyId/register', requireRole('STUDENT'), registerForDrive);

// TPO viewing all registered students for a drive
router.get('/:companyId/students', requireRole('TPO_ADMIN'), getRegisteredStudents);

module.exports = router;
