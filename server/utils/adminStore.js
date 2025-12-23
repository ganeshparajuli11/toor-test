import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMINS_FILE = path.join(__dirname, '../data/admins.json');
const SALT_ROUNDS = 12;

/**
 * Admin Store - Manages admin user data persistence
 * Roles: 'super_admin' (can create other admins), 'admin' (regular admin)
 */

// Ensure admins file exists with default super admin
const ensureAdminsFile = () => {
    const dir = path.dirname(ADMINS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(ADMINS_FILE)) {
        // Create default super admin
        const defaultAdmin = {
            admins: [
                {
                    id: uuidv4(),
                    email: 'admin@zanafly.com',
                    passwordHash: bcrypt.hashSync('admin@123', SALT_ROUNDS),
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'super_admin',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLogin: null,
                    createdBy: null
                }
            ],
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(defaultAdmin, null, 2));
        console.log('[AdminStore] Created default super admin: admin@zanafly.com / admin@123');
    }
};

// Read admins from file
const readAdmins = () => {
    ensureAdminsFile();
    try {
        const data = fs.readFileSync(ADMINS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[AdminStore] Error reading admins file:', error);
        return { admins: [], lastUpdated: null };
    }
};

// Write admins to file
const writeAdmins = (data) => {
    ensureAdminsFile();
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('[AdminStore] Error writing admins file:', error);
        return false;
    }
};

/**
 * Find admin by email
 * @param {string} email
 * @returns {Object|null} Admin or null
 */
export const findAdminByEmail = async (email) => {
    const data = readAdmins();
    return data.admins.find(a => a.email === email.toLowerCase().trim()) || null;
};

/**
 * Find admin by ID
 * @param {string} id
 * @returns {Object|null} Admin or null
 */
export const findAdminById = async (id) => {
    const data = readAdmins();
    return data.admins.find(a => a.id === id) || null;
};

/**
 * Verify admin password
 * @param {string} email
 * @param {string} password
 * @returns {Object|null} Admin if password matches, null otherwise
 */
export const verifyAdminPassword = async (email, password) => {
    const admin = await findAdminByEmail(email);
    if (!admin) return null;

    if (!admin.isActive) {
        throw new Error('Admin account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return null;

    // Update last login
    await updateAdmin(admin.id, { lastLogin: new Date().toISOString() });

    // Return admin without sensitive data
    const { passwordHash, ...safeAdmin } = admin;
    return safeAdmin;
};

/**
 * Create a new admin
 * @param {Object} adminData - Admin data (email, password, firstName, lastName, role)
 * @param {string} createdById - ID of the admin creating this account
 * @returns {Object} Created admin (without password)
 */
export const createAdmin = async (adminData, createdById) => {
    const { email, password, firstName, lastName, role = 'admin' } = adminData;

    // Check if admin already exists
    const existing = await findAdminByEmail(email);
    if (existing) {
        throw new Error('Admin with this email already exists');
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
        throw new Error('Invalid role. Must be admin or super_admin');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newAdmin = {
        id: uuidv4(),
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        createdBy: createdById
    };

    const data = readAdmins();
    data.admins.push(newAdmin);
    writeAdmins(data);

    // Return admin without sensitive data
    const { passwordHash: _, ...safeAdmin } = newAdmin;
    return safeAdmin;
};

/**
 * Update admin data
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} Updated admin or null
 */
export const updateAdmin = async (id, updates) => {
    const data = readAdmins();
    const adminIndex = data.admins.findIndex(a => a.id === id);

    if (adminIndex === -1) return null;

    // Don't allow updating sensitive fields directly
    const { passwordHash, id: _, email: __, ...allowedUpdates } = updates;

    data.admins[adminIndex] = {
        ...data.admins[adminIndex],
        ...allowedUpdates,
        updatedAt: new Date().toISOString()
    };

    writeAdmins(data);

    const { passwordHash: ___, ...safeAdmin } = data.admins[adminIndex];
    return safeAdmin;
};

/**
 * Change admin password
 * @param {string} id
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {boolean} Success
 */
export const changeAdminPassword = async (id, currentPassword, newPassword) => {
    const data = readAdmins();
    const adminIndex = data.admins.findIndex(a => a.id === id);

    if (adminIndex === -1) return false;

    const admin = data.admins[adminIndex];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) return false;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    data.admins[adminIndex].passwordHash = passwordHash;
    data.admins[adminIndex].updatedAt = new Date().toISOString();

    writeAdmins(data);
    return true;
};

/**
 * Get all admins (without passwords)
 * @returns {Array} List of admins
 */
export const getAllAdmins = async () => {
    const data = readAdmins();
    return data.admins.map(({ passwordHash, ...admin }) => admin);
};

/**
 * Deactivate admin
 * @param {string} id
 * @returns {Object|null} Updated admin or null
 */
export const deactivateAdmin = async (id) => {
    return updateAdmin(id, { isActive: false });
};

/**
 * Activate admin
 * @param {string} id
 * @returns {Object|null} Updated admin or null
 */
export const activateAdmin = async (id) => {
    return updateAdmin(id, { isActive: true });
};

/**
 * Delete admin (only super_admin can do this)
 * @param {string} id
 * @returns {boolean} Success
 */
export const deleteAdmin = async (id) => {
    const data = readAdmins();
    const adminIndex = data.admins.findIndex(a => a.id === id);

    if (adminIndex === -1) return false;

    // Prevent deleting the last super_admin
    const admin = data.admins[adminIndex];
    if (admin.role === 'super_admin') {
        const superAdminCount = data.admins.filter(a => a.role === 'super_admin' && a.isActive).length;
        if (superAdminCount <= 1) {
            throw new Error('Cannot delete the last super admin');
        }
    }

    data.admins.splice(adminIndex, 1);
    writeAdmins(data);
    return true;
};

export default {
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
};
