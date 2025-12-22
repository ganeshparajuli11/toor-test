import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET_FILE = path.join(__dirname, '../data/jwt_secret.key');

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

/**
 * Get or generate JWT secret
 * Stores it in a file for persistence across restarts
 */
const getJwtSecret = () => {
    try {
        // Try to read existing secret
        if (fs.existsSync(JWT_SECRET_FILE)) {
            return fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim();
        }

        // Generate new secret
        const secret = crypto.randomBytes(64).toString('hex');

        // Ensure directory exists
        const dir = path.dirname(JWT_SECRET_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save secret
        fs.writeFileSync(JWT_SECRET_FILE, secret);
        console.log('[JWT] Generated new JWT secret');

        return secret;
    } catch (error) {
        console.error('[JWT] Error with JWT secret:', error);
        // Fallback to environment variable or random (not recommended for production)
        return process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    }
};

const JWT_SECRET = getJwtSecret();

/**
 * Generate access token
 * @param {Object} user - User object (id, email, firstName, lastName)
 * @returns {string} JWT access token
 */
export const generateAccessToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: 'toor-api',
        audience: 'toor-app'
    });
};

/**
 * Generate refresh token
 * @param {Object} user - User object (id)
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (user) => {
    const payload = {
        userId: user.id,
        type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        issuer: 'toor-api',
        audience: 'toor-app'
    });
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
export const generateTokenPair = (user) => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer'
    };
};

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'toor-api',
            audience: 'toor-app'
        });

        if (decoded.type !== 'access') {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('[JWT] Access token verification failed:', error.message);
        return null;
    }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object|null} Decoded payload or null
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'toor-api',
            audience: 'toor-app'
        });

        if (decoded.type !== 'refresh') {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('[JWT] Refresh token verification failed:', error.message);
        return null;
    }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token
 * @returns {Object|null} Decoded payload
 */
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Check if token is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;

        const now = Math.floor(Date.now() / 1000);
        return decoded.exp < now;
    } catch (error) {
        return true;
    }
};

/**
 * Get token expiry time
 * @param {string} token
 * @returns {Date|null}
 */
export const getTokenExpiry = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return null;

        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
};

export default {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    isTokenExpired,
    getTokenExpiry,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
};
