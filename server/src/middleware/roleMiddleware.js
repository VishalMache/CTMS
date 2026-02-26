// ============================================================
// CPMS – Role Middleware (src/middleware/roleMiddleware.js)
// Usage: router.use(requireRole('TPO_ADMIN'))
// ============================================================

/**
 * Factory function that returns a middleware enforcing role access.
 * @param {...string} allowedRoles - One or more roles that may access the route.
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]`,
        });
    }

    next();
};

module.exports = requireRole;
