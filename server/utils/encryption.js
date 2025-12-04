import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_FILE = path.join(__dirname, '../../data/master.key');

// Ensure we have a master key for encryption
function getMasterKey() {
    if (!fs.existsSync(path.dirname(KEY_FILE))) {
        fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    }

    if (fs.existsSync(KEY_FILE)) {
        return Buffer.from(fs.readFileSync(KEY_FILE, 'utf-8'), 'hex');
    }

    const key = crypto.randomBytes(32);
    fs.writeFileSync(KEY_FILE, key.toString('hex'));
    return key;
}

const ALGORITHM = 'aes-256-gcm';
const MASTER_KEY = getMasterKey();

export function encrypt(text) {
    if (!text) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(text) {
    if (!text || !text.includes(':')) return text;

    try {
        const parts = text.split(':');
        if (parts.length !== 3) return text; // Not encrypted or invalid format

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return text; // Return original if decryption fails (might be plain text)
    }
}
