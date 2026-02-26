// ============================================================
// CPMS – Training Routes (src/routes/trainingRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    getSessions,
    createSession,
    deleteSession,
    getAttendance,
    markAttendance,
    joinSession
} = require('../controllers/trainingController');

router.use(protect); // All routes protected

// ── Shared ──────────────────────────────────────────────────
router.get('/', getSessions);

// ── Student Only ────────────────────────────────────────────
router.post('/:id/join', requireRole('STUDENT'), joinSession);

// ── Admin Only ──────────────────────────────────────────────
router.post('/', requireRole('TPO_ADMIN'), createSession);
router.delete('/:id', requireRole('TPO_ADMIN'), deleteSession);
router.get('/:id/attendance', requireRole('TPO_ADMIN'), getAttendance);
router.post('/:id/attendance', requireRole('TPO_ADMIN'), markAttendance);

module.exports = router;
