import { verifyAdminAccessToken } from '../utils/jwt.js';
import { findAdminById } from '../utils/adminStore.js';

/**
 * Admin Authentication Middleware
 * Verifies JWT admin token and attaches admin to request
 */

/**
 * Required admin authentication middleware
 * Returns 401 if no valid admin token
 */
export const requireAdmin = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No admin token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify admin token
        const decoded = verifyAdminAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired admin token.'
            });
        }

        // Get admin from database
        const admin = await findAdminById(decoded.adminId);

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found.'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Admin account is deactivated.'
            });
        }

        // Attach admin to request (without sensitive data)
        const { passwordHash, ...safeAdmin } = admin;
        req.admin = safeAdmin;
        req.adminId = admin.id;
        req.adminRole = admin.role;

        next();
    } catch (error) {
        console.error('[Admin Auth Middleware] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Admin authentication error.'
        });
    }
};

/**
 * Require super_admin role middleware
 * Use after requireAdmin
 */
export const requireSuperAdmin = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            error: 'Admin authentication required.'
        });
    }

    if (req.adminRole !== 'super_admin') {
        return res.status(403).json({
            success: false,
            error: 'Super admin privileges required.',
            code: 'INSUFFICIENT_PRIVILEGES'
        });
    }

    next();
};

/**
 * Rate limiting for admin auth routes
 * Simple in-memory rate limiting (use Redis in production)
 */
const adminAuthAttempts = new Map();
const MAX_ADMIN_ATTEMPTS = 5;
const ADMIN_WINDOW_MS = 30 * 60 * 1000; // 30 minutes (stricter for admin)

export const adminAuthRateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean old entries
    for (const [key, value] of adminAuthAttempts.entries()) {
        if (now - value.firstAttempt > ADMIN_WINDOW_MS) {
            adminAuthAttempts.delete(key);
        }
    }

    const attempts = adminAuthAttempts.get(ip);

    if (attempts) {
        if (attempts.count >= MAX_ADMIN_ATTEMPTS) {
            const timeLeft = Math.ceil((ADMIN_WINDOW_MS - (now - attempts.firstAttempt)) / 1000 / 60);
            return res.status(429).json({
                success: false,
                error: `Too many admin login attempts. Please try again in ${timeLeft} minutes.`,
                code: 'ADMIN_RATE_LIMIT_EXCEEDED'
            });
        }

        attempts.count++;
    } else {
        adminAuthAttempts.set(ip, {
            count: 1,
            firstAttempt: now
        });
    }

    next();
};

/**
 * Reset admin rate limit on successful auth
 */
export const resetAdminRateLimit = (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    adminAuthAttempts.delete(ip);
};

export default {
    requireAdmin,
    requireSuperAdmin,
    adminAuthRateLimit,
    resetAdminRateLimit
};
