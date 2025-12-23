import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSettings, saveSettings } from '../config/store.js';
import {
    findAdminByEmail,
    findAdminById,
    verifyAdminPassword,
    createAdmin,
    updateAdmin,
    changeAdminPassword,
    getAllAdmins,
    deactivateAdmin,
    activateAdmin,
    deleteAdmin
} from '../utils/adminStore.js';
import {
    getAllUsers,
    getUserStats,
    updateUserStatus,
    deleteUser,
    findUserById
} from '../utils/userStore.js';
import {
    generateAdminTokenPair,
    verifyAdminRefreshToken
} from '../utils/jwt.js';
import {
    requireAdmin,
    requireSuperAdmin,
    adminAuthRateLimit,
    resetAdminRateLimit
} from '../middleware/adminAuth.js';
import {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
} from '../utils/hotelStore.js';
import {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
} from '../utils/carStore.js';
import {
    getAllCruises,
    getCruiseById,
    createCruise,
    updateCruise,
    deleteCruise
} from '../utils/cruiseStore.js';

const router = express.Router();

/**
 * Validation Rules
 */
const loginValidation = [
    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const createAdminValidation = [
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
    body('role')
        .optional()
        .isIn(['admin', 'super_admin']).withMessage('Invalid role')
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

// ==================== Authentication Routes ====================

/**
 * POST /api/admin/auth/login
 * Admin login
 */
router.post('/auth/login', adminAuthRateLimit, loginValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email, password } = req.body;

        console.log('[Admin Auth] Login attempt for:', email);

        // Verify credentials
        const admin = await verifyAdminPassword(email, password);

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.'
            });
        }

        // Generate tokens
        const tokens = generateAdminTokenPair(admin);

        // Reset rate limit on success
        resetAdminRateLimit(req);

        console.log('[Admin Auth] Login successful for:', admin.id, '- Role:', admin.role);

        res.json({
            success: true,
            message: 'Admin login successful.',
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role,
                lastLogin: admin.lastLogin
            },
            ...tokens
        });
    } catch (error) {
        console.error('[Admin Auth] Login error:', error);

        if (error.message === 'Admin account is deactivated') {
            return res.status(403).json({
                success: false,
                error: 'Your admin account has been deactivated. Contact a super admin.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Admin login failed. Please try again.'
        });
    }
});

/**
 * POST /api/admin/auth/refresh
 * Refresh admin access token using refresh token
 */
router.post('/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required.'
            });
        }

        // Verify refresh token
        const decoded = verifyAdminRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token.'
            });
        }

        // Get admin
        const admin = await findAdminById(decoded.adminId);

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found.'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Admin account is deactivated.'
            });
        }

        // Generate new tokens
        const tokens = generateAdminTokenPair(admin);

        console.log('[Admin Auth] Token refreshed for:', admin.id);

        res.json({
            success: true,
            ...tokens
        });
    } catch (error) {
        console.error('[Admin Auth] Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Token refresh failed.'
        });
    }
});

/**
 * GET /api/admin/auth/me
 * Get current admin info
 */
router.get('/auth/me', requireAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            admin: req.admin
        });
    } catch (error) {
        console.error('[Admin Auth] Get admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get admin information.'
        });
    }
});

/**
 * POST /api/admin/auth/logout
 * Admin logout (client-side token removal, server-side logging)
 */
router.post('/auth/logout', requireAdmin, async (req, res) => {
    try {
        console.log('[Admin Auth] Logout for:', req.adminId);

        res.json({
            success: true,
            message: 'Admin logged out successfully.'
        });
    } catch (error) {
        console.error('[Admin Auth] Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed.'
        });
    }
});

/**
 * POST /api/admin/auth/change-password
 * Change admin password (when logged in)
 */
router.post('/auth/change-password', requireAdmin, changePasswordValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { currentPassword, newPassword } = req.body;

        const success = await changeAdminPassword(req.adminId, currentPassword, newPassword);

        if (!success) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect.'
            });
        }

        console.log('[Admin Auth] Password changed for:', req.adminId);

        res.json({
            success: true,
            message: 'Password changed successfully.'
        });
    } catch (error) {
        console.error('[Admin Auth] Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password.'
        });
    }
});

// ==================== Admin Management Routes ====================

/**
 * GET /api/admin/admins
 * Get all admins (super_admin only)
 */
router.get('/admins', requireAdmin, requireSuperAdmin, async (req, res) => {
    try {
        const admins = await getAllAdmins();

        res.json({
            success: true,
            admins
        });
    } catch (error) {
        console.error('[Admin] Get admins error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get admins.'
        });
    }
});

/**
 * POST /api/admin/admins
 * Create a new admin (super_admin only)
 */
router.post('/admins', requireAdmin, requireSuperAdmin, createAdminValidation, async (req, res) => {
    try {
        const validationError = handleValidationErrors(req, res);
        if (validationError) return validationError;

        const { email, password, firstName, lastName, role } = req.body;

        console.log('[Admin] Creating new admin:', email, '- Role:', role || 'admin');

        const newAdmin = await createAdmin(
            { email, password, firstName, lastName, role },
            req.adminId // Created by current admin
        );

        console.log('[Admin] New admin created:', newAdmin.id);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully.',
            admin: newAdmin
        });
    } catch (error) {
        console.error('[Admin] Create admin error:', error);

        if (error.message === 'Admin with this email already exists') {
            return res.status(409).json({
                success: false,
                error: 'An admin with this email already exists.'
            });
        }

        if (error.message === 'Invalid role. Must be admin or super_admin') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create admin.'
        });
    }
});

/**
 * PUT /api/admin/admins/:id
 * Update an admin (super_admin only)
 */
router.put('/admins/:id', requireAdmin, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, role, isActive } = req.body;

        const updates = {};
        if (firstName) updates.firstName = firstName.trim();
        if (lastName) updates.lastName = lastName.trim();
        if (role && ['admin', 'super_admin'].includes(role)) updates.role = role;
        if (typeof isActive === 'boolean') updates.isActive = isActive;

        const admin = await updateAdmin(id, updates);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found.'
            });
        }

        console.log('[Admin] Admin updated:', id);

        res.json({
            success: true,
            message: 'Admin updated successfully.',
            admin
        });
    } catch (error) {
        console.error('[Admin] Update admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update admin.'
        });
    }
});

/**
 * DELETE /api/admin/admins/:id
 * Delete an admin (super_admin only)
 */
router.delete('/admins/:id', requireAdmin, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.adminId) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete your own account.'
            });
        }

        const success = await deleteAdmin(id);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found.'
            });
        }

        console.log('[Admin] Admin deleted:', id);

        res.json({
            success: true,
            message: 'Admin deleted successfully.'
        });
    } catch (error) {
        console.error('[Admin] Delete admin error:', error);

        if (error.message === 'Cannot delete the last super admin') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to delete admin.'
        });
    }
});

/**
 * POST /api/admin/admins/:id/deactivate
 * Deactivate an admin (super_admin only)
 */
router.post('/admins/:id/deactivate', requireAdmin, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deactivation
        if (id === req.adminId) {
            return res.status(400).json({
                success: false,
                error: 'You cannot deactivate your own account.'
            });
        }

        const admin = await deactivateAdmin(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found.'
            });
        }

        console.log('[Admin] Admin deactivated:', id);

        res.json({
            success: true,
            message: 'Admin deactivated successfully.',
            admin
        });
    } catch (error) {
        console.error('[Admin] Deactivate admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate admin.'
        });
    }
});

/**
 * POST /api/admin/admins/:id/activate
 * Activate an admin (super_admin only)
 */
router.post('/admins/:id/activate', requireAdmin, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await activateAdmin(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found.'
            });
        }

        console.log('[Admin] Admin activated:', id);

        res.json({
            success: true,
            message: 'Admin activated successfully.',
            admin
        });
    } catch (error) {
        console.error('[Admin] Activate admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate admin.'
        });
    }
});

// ==================== User Management Routes ====================

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await getAllUsers();
        const stats = await getUserStats();

        res.json({
            success: true,
            users,
            stats
        });
    } catch (error) {
        console.error('[Admin] Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users.'
        });
    }
});

/**
 * GET /api/admin/users/:id
 * Get single user
 */
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await findUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }

        const { passwordHash, verificationToken, resetPasswordToken, ...safeUser } = user;

        res.json({
            success: true,
            user: safeUser
        });
    } catch (error) {
        console.error('[Admin] Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user.'
        });
    }
});

/**
 * PUT /api/admin/users/:id/status
 * Update user status
 */
router.put('/users/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'blocked', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be active, blocked, or inactive.'
            });
        }

        const user = await updateUserStatus(req.params.id, status);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }

        res.json({
            success: true,
            message: `User status updated to ${status}.`,
            user
        });
    } catch (error) {
        console.error('[Admin] Update user status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status.'
        });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const success = await deleteUser(req.params.id);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully.'
        });
    } catch (error) {
        console.error('[Admin] Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user.'
        });
    }
});

// ==================== Hotel Management Routes ====================

/**
 * GET /api/admin/hotels
 * Get all hotels
 */
router.get('/hotels', requireAdmin, async (req, res) => {
    try {
        const hotels = await getAllHotels();

        res.json({
            success: true,
            hotels
        });
    } catch (error) {
        console.error('[Admin] Get hotels error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hotels.'
        });
    }
});

/**
 * GET /api/admin/hotels/:id
 * Get single hotel
 */
router.get('/hotels/:id', requireAdmin, async (req, res) => {
    try {
        const hotel = await getHotelById(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found.'
            });
        }

        res.json({
            success: true,
            hotel
        });
    } catch (error) {
        console.error('[Admin] Get hotel error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hotel.'
        });
    }
});

/**
 * POST /api/admin/hotels
 * Create new hotel
 */
router.post('/hotels', requireAdmin, async (req, res) => {
    try {
        const hotel = await createHotel(req.body);

        res.status(201).json({
            success: true,
            message: 'Hotel created successfully.',
            hotel
        });
    } catch (error) {
        console.error('[Admin] Create hotel error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create hotel.'
        });
    }
});

/**
 * PUT /api/admin/hotels/:id
 * Update hotel
 */
router.put('/hotels/:id', requireAdmin, async (req, res) => {
    try {
        const hotel = await updateHotel(req.params.id, req.body);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found.'
            });
        }

        res.json({
            success: true,
            message: 'Hotel updated successfully.',
            hotel
        });
    } catch (error) {
        console.error('[Admin] Update hotel error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update hotel.'
        });
    }
});

/**
 * DELETE /api/admin/hotels/:id
 * Delete hotel
 */
router.delete('/hotels/:id', requireAdmin, async (req, res) => {
    try {
        const success = await deleteHotel(req.params.id);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found.'
            });
        }

        res.json({
            success: true,
            message: 'Hotel deleted successfully.'
        });
    } catch (error) {
        console.error('[Admin] Delete hotel error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete hotel.'
        });
    }
});

// ==================== Car Management Routes ====================

/**
 * GET /api/admin/cars
 * Get all cars
 */
router.get('/cars', requireAdmin, async (req, res) => {
    try {
        const cars = await getAllCars();

        res.json({
            success: true,
            cars
        });
    } catch (error) {
        console.error('[Admin] Get cars error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cars.'
        });
    }
});

/**
 * GET /api/admin/cars/:id
 * Get single car
 */
router.get('/cars/:id', requireAdmin, async (req, res) => {
    try {
        const car = await getCarById(req.params.id);

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found.'
            });
        }

        res.json({
            success: true,
            car
        });
    } catch (error) {
        console.error('[Admin] Get car error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch car.'
        });
    }
});

/**
 * POST /api/admin/cars
 * Create new car
 */
router.post('/cars', requireAdmin, async (req, res) => {
    try {
        const car = await createCar(req.body);

        res.status(201).json({
            success: true,
            message: 'Car created successfully.',
            car
        });
    } catch (error) {
        console.error('[Admin] Create car error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create car.'
        });
    }
});

/**
 * PUT /api/admin/cars/:id
 * Update car
 */
router.put('/cars/:id', requireAdmin, async (req, res) => {
    try {
        const car = await updateCar(req.params.id, req.body);

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found.'
            });
        }

        res.json({
            success: true,
            message: 'Car updated successfully.',
            car
        });
    } catch (error) {
        console.error('[Admin] Update car error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update car.'
        });
    }
});

/**
 * DELETE /api/admin/cars/:id
 * Delete car
 */
router.delete('/cars/:id', requireAdmin, async (req, res) => {
    try {
        const success = await deleteCar(req.params.id);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Car not found.'
            });
        }

        res.json({
            success: true,
            message: 'Car deleted successfully.'
        });
    } catch (error) {
        console.error('[Admin] Delete car error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete car.'
        });
    }
});

// ==================== Cruise Management Routes ====================

/**
 * GET /api/admin/cruises
 * Get all cruises
 */
router.get('/cruises', requireAdmin, async (req, res) => {
    try {
        const cruises = await getAllCruises();

        res.json({
            success: true,
            cruises
        });
    } catch (error) {
        console.error('[Admin] Get cruises error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cruises.'
        });
    }
});

/**
 * GET /api/admin/cruises/:id
 * Get single cruise
 */
router.get('/cruises/:id', requireAdmin, async (req, res) => {
    try {
        const cruise = await getCruiseById(req.params.id);

        if (!cruise) {
            return res.status(404).json({
                success: false,
                error: 'Cruise not found.'
            });
        }

        res.json({
            success: true,
            cruise
        });
    } catch (error) {
        console.error('[Admin] Get cruise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cruise.'
        });
    }
});

/**
 * POST /api/admin/cruises
 * Create new cruise
 */
router.post('/cruises', requireAdmin, async (req, res) => {
    try {
        const cruise = await createCruise(req.body);

        res.status(201).json({
            success: true,
            message: 'Cruise created successfully.',
            cruise
        });
    } catch (error) {
        console.error('[Admin] Create cruise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create cruise.'
        });
    }
});

/**
 * PUT /api/admin/cruises/:id
 * Update cruise
 */
router.put('/cruises/:id', requireAdmin, async (req, res) => {
    try {
        const cruise = await updateCruise(req.params.id, req.body);

        if (!cruise) {
            return res.status(404).json({
                success: false,
                error: 'Cruise not found.'
            });
        }

        res.json({
            success: true,
            message: 'Cruise updated successfully.',
            cruise
        });
    } catch (error) {
        console.error('[Admin] Update cruise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update cruise.'
        });
    }
});

/**
 * DELETE /api/admin/cruises/:id
 * Delete cruise
 */
router.delete('/cruises/:id', requireAdmin, async (req, res) => {
    try {
        const success = await deleteCruise(req.params.id);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Cruise not found.'
            });
        }

        res.json({
            success: true,
            message: 'Cruise deleted successfully.'
        });
    } catch (error) {
        console.error('[Admin] Delete cruise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete cruise.'
        });
    }
});

// ==================== Settings Routes ====================

/**
 * GET /api/admin/settings
 * Get all API settings (requires admin auth)
 */
router.get('/settings', requireAdmin, async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

/**
 * POST /api/admin/settings
 * Save API settings (requires admin auth)
 */
router.post('/settings', requireAdmin, async (req, res) => {
    try {
        const updatedSettings = await saveSettings(req.body);
        res.json({ success: true, settings: updatedSettings });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ message: 'Failed to save settings' });
    }
});

export default router;
