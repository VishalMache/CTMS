// ============================================================
// CPMS – Auth Routes (src/routes/authRoutes.js)
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register  – Create a new User (+ Student profile if role=STUDENT)
router.post('/register', register);

// POST /api/auth/login     – Authenticate and receive JWT
router.post('/login', login);

// GET  /api/auth/me        – Protected: get current user profile
router.get('/me', authMiddleware, getMe);

module.exports = router;
