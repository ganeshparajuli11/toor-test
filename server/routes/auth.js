import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    createUser,
    findUserByEmail,
    findUserById,
    verifyPassword,
    verifyEmail,
    generateResetToken,
    resetPassword,
    updateUser,
    changePassword,
    regenerateVerificationToken,
    getUserBookings
} from '../utils/userStore.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { requireAuth, authRateLimit, resetRateLimit } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

/**
 * Validation Rules
 */
const registerValidation = [
    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name too long'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name too long'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone('any').withMessage('Please enter a valid phone number')
];

const loginValidation = [
    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail()
];

const resetPasswordValidation = [
    body('token')
        .notEmpty().withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
];

/**
 * Helper: Handle validation errors
 */
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    return null;
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authRateLimit, registerValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email, password, firstName, lastName, phone } = req.body;

        console.log('[Auth] Registration attempt for:', email);

        // Create user
        const user = await createUser({
            email,
            password,
            firstName,
            lastName,
            phone
        });

        // Send verification email
        await sendVerificationEmail(email, firstName, user.verificationToken);

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Reset rate limit on success
        resetRateLimit(req);

        console.log('[Auth] User registered successfully:', user.id);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            },
            ...tokens
        });
    } catch (error) {
        console.error('[Auth] Registration error:', error);

        if (error.message === 'User with this email already exists') {
            return res.status(409).json({
                success: false,
                error: 'An account with this email already exists.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', authRateLimit, loginValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email, password } = req.body;

        console.log('[Auth] Login attempt for:', email);

        // Verify credentials
        const user = await verifyPassword(email, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.'
            });
        }

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Reset rate limit on success
        resetRateLimit(req);

        console.log('[Auth] Login successful for:', user.id);

        res.json({
            success: true,
            message: 'Login successful.',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                avatar: user.avatar,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            },
            ...tokens
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required.'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token.'
            });
        }

        // Get user
        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found.'
            });
        }

        // Generate new tokens
        const tokens = generateTokenPair(user);

        console.log('[Auth] Token refreshed for:', user.id);

        res.json({
            success: true,
            ...tokens
        });
    } catch (error) {
        console.error('[Auth] Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Token refresh failed.'
        });
    }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required.'
            });
        }

        console.log('[Auth] Email verification attempt');

        const user = await verifyEmail(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired verification token.'
            });
        }

        console.log('[Auth] Email verified for:', user.id);

        res.json({
            success: true,
            message: 'Email verified successfully.',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('[Auth] Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Email verification failed.'
        });
    }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', authRateLimit, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required.'
            });
        }

        console.log('[Auth] Resend verification for:', email);

        const result = await regenerateVerificationToken(email);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }

        // Send verification email
        await sendVerificationEmail(email, result.user.firstName, result.verificationToken);

        res.json({
            success: true,
            message: 'Verification email sent.'
        });
    } catch (error) {
        console.error('[Auth] Resend verification error:', error);

        if (error.message === 'User is already verified') {
            return res.status(400).json({
                success: false,
                error: 'This email is already verified.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to resend verification email.'
        });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', authRateLimit, forgotPasswordValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email } = req.body;

        console.log('[Auth] Password reset requested for:', email);

        // Generate reset token
        const result = await generateResetToken(email);

        // Always return success (don't reveal if email exists)
        if (result) {
            await sendPasswordResetEmail(email, result.user.firstName, result.resetToken);
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('[Auth] Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process password reset request.'
        });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { token, password } = req.body;

        console.log('[Auth] Password reset attempt');

        const user = await resetPassword(token, password);

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token.'
            });
        }

        console.log('[Auth] Password reset successful for:', user.id);

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        console.error('[Auth] Password reset error:', error);
        res.status(500).json({
            success: false,
            error: 'Password reset failed.'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', requireAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('[Auth] Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user information.'
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { firstName, lastName, phone, avatar, bio, location, dateOfBirth, gender, nationality } = req.body;

        const updates = {};
        if (firstName) updates.firstName = firstName.trim();
        if (lastName) updates.lastName = lastName.trim();
        if (phone !== undefined) updates.phone = phone?.trim() || null;
        if (avatar !== undefined) updates.avatar = avatar;
        if (bio !== undefined) updates.bio = bio?.trim() || null;
        if (location !== undefined) updates.location = location?.trim() || null;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updates.gender = gender;
        if (nationality !== undefined) updates.nationality = nationality?.trim() || null;

        const user = await updateUser(req.userId, updates);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }

        console.log('[Auth] Profile updated for:', user.id);

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            user
        });
    } catch (error) {
        console.error('[Auth] Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile.'
        });
    }
});

/**
 * POST /api/auth/change-password
 * Change password (when logged in)
 */
router.post('/change-password', requireAuth, changePasswordValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { currentPassword, newPassword } = req.body;

        const success = await changePassword(req.userId, currentPassword, newPassword);

        if (!success) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect.'
            });
        }

        console.log('[Auth] Password changed for:', req.userId);

        res.json({
            success: true,
            message: 'Password changed successfully.'
        });
    } catch (error) {
        console.error('[Auth] Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password.'
        });
    }
});

/**
 * GET /api/auth/bookings
 * Get user's bookings
 */
router.get('/bookings', requireAuth, async (req, res) => {
    try {
        const bookings = await getUserBookings(req.userId);

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('[Auth] Get bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get bookings.'
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, server-side logging)
 */
router.post('/logout', requireAuth, async (req, res) => {
    try {
        console.log('[Auth] Logout for:', req.userId);

        // In a production system, you might want to:
        // - Add the refresh token to a blacklist
        // - Clear any server-side sessions

        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (error) {
        console.error('[Auth] Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed.'
        });
    }
});

export default router;
