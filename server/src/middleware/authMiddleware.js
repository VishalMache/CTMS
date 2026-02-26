// ============================================================
// CPMS – Auth Middleware (src/middleware/authMiddleware.js)
// Verifies JWT token and attaches user info to req.user
// ============================================================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify and decode
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role, iat, exp }

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
