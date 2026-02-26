// ============================================================
// CPMS – Notification Routes (src/routes/notificationRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    broadcastNotification
} = require('../controllers/notificationController');

// ── All routes below require authentication ─────────────────
router.use(protect);

// ── Shared (Student & Admin) ────────────────────────────────
router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

// ── Admin-Only ──────────────────────────────────────────────
router.post('/broadcast', requireRole('TPO_ADMIN'), broadcastNotification);

module.exports = router;
