// ============================================================
// CPMS – Mock Test Routes (src/routes/mockTestRoutes.js)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    getTests,
    createTest,
    toggleTestStatus,
    deleteTest,
    addQuestion,
    deleteQuestion,
    takeTest,
    submitTest,
    getTestResults
} = require('../controllers/mockTestController');

router.use(protect); // All protected

// ── Shared ──────────────────────────────────────────────────
router.get('/', getTests);

// ── Student Only ────────────────────────────────────────────
router.get('/:id/take', requireRole('STUDENT'), takeTest);
router.post('/:id/submit', requireRole('STUDENT'), submitTest);

// ── Admin Only ──────────────────────────────────────────────
router.post('/', requireRole('TPO_ADMIN'), createTest);
router.patch('/:id/toggle', requireRole('TPO_ADMIN'), toggleTestStatus);
router.delete('/:id', requireRole('TPO_ADMIN'), deleteTest);
router.post('/:id/questions', requireRole('TPO_ADMIN'), addQuestion);
router.delete('/questions/:questionId', requireRole('TPO_ADMIN'), deleteQuestion);
router.get('/:id/results', requireRole('TPO_ADMIN'), getTestResults);

module.exports = router;
