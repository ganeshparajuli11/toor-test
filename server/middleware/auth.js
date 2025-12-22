import { verifyAccessToken } from '../utils/jwt.js';
import { findUserById } from '../utils/userStore.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

/**
 * Required authentication middleware
 * Returns 401 if no valid token
 */
export const requireAuth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token.'
            });
        }

        // Get user from database
        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found.'
            });
        }

        // Check if user is verified (optional, can be disabled for some routes)
        // Uncomment if you want to require email verification
        // if (!user.isVerified) {
        //     return res.status(403).json({
        //         success: false,
        //         error: 'Please verify your email address.'
        //     });
        // }

        // Attach user to request (without sensitive data)
        const { passwordHash, verificationToken, resetPasswordToken, ...safeUser } = user;
        req.user = safeUser;
        req.userId = user.id;

        next();
    } catch (error) {
        console.error('[Auth Middleware] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error.'
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if valid token, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue without user
            req.user = null;
            req.userId = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);

        if (decoded) {
            const user = await findUserById(decoded.userId);
            if (user) {
                const { passwordHash, verificationToken, resetPasswordToken, ...safeUser } = user;
                req.user = safeUser;
                req.userId = user.id;
            }
        }

        next();
    } catch (error) {
        // Don't fail on error, just continue without user
        req.user = null;
        req.userId = null;
        next();
    }
};

/**
 * Require verified email middleware
 * Use after requireAuth
 */
export const requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required.'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            error: 'Please verify your email address.',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }

    next();
};

/**
 * Rate limiting for auth routes
 * Simple in-memory rate limiting (use Redis in production)
 */
const authAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const authRateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean old entries
    for (const [key, value] of authAttempts.entries()) {
        if (now - value.firstAttempt > WINDOW_MS) {
            authAttempts.delete(key);
        }
    }

    const attempts = authAttempts.get(ip);

    if (attempts) {
        if (attempts.count >= MAX_ATTEMPTS) {
            const timeLeft = Math.ceil((WINDOW_MS - (now - attempts.firstAttempt)) / 1000 / 60);
            return res.status(429).json({
                success: false,
                error: `Too many attempts. Please try again in ${timeLeft} minutes.`,
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }

        attempts.count++;
    } else {
        authAttempts.set(ip, {
            count: 1,
            firstAttempt: now
        });
    }

    next();
};

/**
 * Reset rate limit on successful auth
 */
export const resetRateLimit = (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    authAttempts.delete(ip);
};

export default {
    requireAuth,
    optionalAuth,
    requireVerified,
    authRateLimit,
    resetRateLimit
};
