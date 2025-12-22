import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');
const SALT_ROUNDS = 12;

/**
 * User Store - Manages user data persistence
 */

// Ensure users file exists
const ensureUsersFile = () => {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [], lastUpdated: null }, null, 2));
    }
};

// Read users from file
const readUsers = () => {
    ensureUsersFile();
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[UserStore] Error reading users file:', error);
        return { users: [], lastUpdated: null };
    }
};

// Write users to file
const writeUsers = (data) => {
    ensureUsersFile();
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('[UserStore] Error writing users file:', error);
        return false;
    }
};

/**
 * Create a new user
 * @param {Object} userData - User data (email, password, firstName, lastName, phone)
 * @returns {Object} Created user (without password)
 */
export const createUser = async (userData) => {
    const { email, password, firstName, lastName, phone } = userData;

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = {
        id: uuidv4(),
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        avatar: null,
        isVerified: false,
        verificationToken,
        verificationExpires: verificationExpires.toISOString(),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        bookings: []
    };

    const data = readUsers();
    data.users.push(newUser);
    writeUsers(data);

    // Return user without sensitive data
    const { passwordHash: _, verificationToken: __, resetPasswordToken: ___, ...safeUser } = newUser;
    return { ...safeUser, verificationToken }; // Include token for email sending
};

/**
 * Find user by email
 * @param {string} email
 * @returns {Object|null} User or null
 */
export const findUserByEmail = async (email) => {
    const data = readUsers();
    return data.users.find(u => u.email === email.toLowerCase().trim()) || null;
};

/**
 * Find user by ID
 * @param {string} id
 * @returns {Object|null} User or null
 */
export const findUserById = async (id) => {
    const data = readUsers();
    return data.users.find(u => u.id === id) || null;
};

/**
 * Verify user password
 * @param {string} email
 * @param {string} password
 * @returns {Object|null} User if password matches, null otherwise
 */
export const verifyPassword = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    // Update last login
    await updateUser(user.id, { lastLogin: new Date().toISOString() });

    // Return user without sensitive data
    const { passwordHash, verificationToken, resetPasswordToken, ...safeUser } = user;
    return safeUser;
};

/**
 * Verify email with token
 * @param {string} token
 * @returns {Object|null} User if verified, null otherwise
 */
export const verifyEmail = async (token) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.verificationToken === token);

    if (userIndex === -1) return null;

    const user = data.users[userIndex];

    // Check if token expired
    if (new Date(user.verificationExpires) < new Date()) {
        return null;
    }

    // Mark as verified
    data.users[userIndex].isVerified = true;
    data.users[userIndex].verificationToken = null;
    data.users[userIndex].verificationExpires = null;
    data.users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(data);

    const { passwordHash, verificationToken: _, resetPasswordToken, ...safeUser } = data.users[userIndex];
    return safeUser;
};

/**
 * Generate password reset token
 * @param {string} email
 * @returns {Object|null} { user, resetToken } or null
 */
export const generateResetToken = async (email) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.email === email.toLowerCase().trim());

    if (userIndex === -1) return null;

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    data.users[userIndex].resetPasswordToken = resetToken;
    data.users[userIndex].resetPasswordExpires = resetExpires.toISOString();
    data.users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(data);

    const { passwordHash, verificationToken, resetPasswordToken: _, ...safeUser } = data.users[userIndex];
    return { user: safeUser, resetToken };
};

/**
 * Reset password with token
 * @param {string} token
 * @param {string} newPassword
 * @returns {Object|null} User if reset successful, null otherwise
 */
export const resetPassword = async (token, newPassword) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.resetPasswordToken === token);

    if (userIndex === -1) return null;

    const user = data.users[userIndex];

    // Check if token expired
    if (new Date(user.resetPasswordExpires) < new Date()) {
        return null;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    data.users[userIndex].passwordHash = passwordHash;
    data.users[userIndex].resetPasswordToken = null;
    data.users[userIndex].resetPasswordExpires = null;
    data.users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(data);

    const { passwordHash: _, verificationToken, resetPasswordToken: __, ...safeUser } = data.users[userIndex];
    return safeUser;
};

/**
 * Update user data
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} Updated user or null
 */
export const updateUser = async (id, updates) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) return null;

    // Don't allow updating sensitive fields directly
    const { passwordHash, verificationToken, resetPasswordToken, id: _, email: __, ...allowedUpdates } = updates;

    data.users[userIndex] = {
        ...data.users[userIndex],
        ...allowedUpdates,
        updatedAt: new Date().toISOString()
    };

    writeUsers(data);

    const { passwordHash: ___, verificationToken: ____, resetPasswordToken: _____, ...safeUser } = data.users[userIndex];
    return safeUser;
};

/**
 * Change user password
 * @param {string} id
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {boolean} Success
 */
export const changePassword = async (id, currentPassword, newPassword) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) return false;

    const user = data.users[userIndex];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return false;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    data.users[userIndex].passwordHash = passwordHash;
    data.users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(data);
    return true;
};

/**
 * Add booking to user
 * @param {string} userId
 * @param {Object} booking
 * @returns {Object|null} Updated user or null
 */
export const addBookingToUser = async (userId, booking) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) return null;

    if (!data.users[userIndex].bookings) {
        data.users[userIndex].bookings = [];
    }

    data.users[userIndex].bookings.push({
        ...booking,
        addedAt: new Date().toISOString()
    });

    data.users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(data);

    const { passwordHash, verificationToken, resetPasswordToken, ...safeUser } = data.users[userIndex];
    return safeUser;
};

/**
 * Get user bookings
 * @param {string} userId
 * @returns {Array} Bookings array
 */
export const getUserBookings = async (userId) => {
    const user = await findUserById(userId);
    return user?.bookings || [];
};

/**
 * Resend verification email (regenerate token)
 * @param {string} email
 * @returns {Object|null} { user, verificationToken } or null
 */
export const regenerateVerificationToken = async (email) => {
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.email === email.toLowerCase().trim());

    if (userIndex === -1) return null;

    if (data.users[userIndex].isVerified) {
        throw new Error('User is already verified');
    }

    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    data.users[userIndex].verificationToken = verificationToken;
    data.users[userIndex].verificationExpires = verificationExpires.toISOString();
    data.users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(data);

    const { passwordHash, resetPasswordToken, ...safeUser } = data.users[userIndex];
    return { user: safeUser, verificationToken };
};

export default {
    createUser,
    findUserByEmail,
    findUserById,
    verifyPassword,
    verifyEmail,
    generateResetToken,
    resetPassword,
    updateUser,
    changePassword,
    addBookingToUser,
    getUserBookings,
    regenerateVerificationToken
};
