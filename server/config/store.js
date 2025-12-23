import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { encrypt, decrypt } from '../utils/encryption.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Default settings
const defaultSettings = {
  ratehawk: {
    apiKey: '3c80ca84-6ee1-49d1-aae8-75da608952ff',
    keyId: '15349',
    environment: 'sandbox'
  },
  stripe: {
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    currency: 'USD',
    enable3DSecure: true
  },
  oauth: {
    google: {
      clientId: '',
      clientSecret: '',
      enabled: false
    },
    facebook: {
      appId: '',
      appSecret: '',
      enabled: false
    }
  },
  email: {
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Zanafly',
    enabled: false
  },
  database: {
    mongodbUrl: '',
    enabled: false
  },
  general: {
    siteName: 'Zanafly',
    siteUrl: '',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC'
  }
};

export async function getSettings() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = { ...defaultSettings, ...JSON.parse(data) };

    // Decrypt sensitive fields
    if (settings.ratehawk?.apiKey) {
      settings.ratehawk.apiKey = decrypt(settings.ratehawk.apiKey);
    }
    if (settings.stripe?.secretKey) {
      settings.stripe.secretKey = decrypt(settings.stripe.secretKey);
    }
    if (settings.stripe?.webhookSecret) {
      settings.stripe.webhookSecret = decrypt(settings.stripe.webhookSecret);
    }
    // Decrypt OAuth secrets
    if (settings.oauth?.google?.clientSecret) {
      settings.oauth.google.clientSecret = decrypt(settings.oauth.google.clientSecret);
    }
    if (settings.oauth?.facebook?.appSecret) {
      settings.oauth.facebook.appSecret = decrypt(settings.oauth.facebook.appSecret);
    }
    // Decrypt email password
    if (settings.email?.smtpPassword) {
      settings.email.smtpPassword = decrypt(settings.email.smtpPassword);
    }
    // Decrypt MongoDB URL
    if (settings.database?.mongodbUrl) {
      settings.database.mongodbUrl = decrypt(settings.database.mongodbUrl);
    }

    return settings;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return defaults
      return defaultSettings;
    }
    throw error;
  }
}

export async function saveSettings(newSettings) {
  await ensureDataDir();
  const current = await getSettings(); // Get currently decrypted settings
  const updated = { ...current, ...newSettings };

  // Merge deep objects like ratehawk and stripe
  if (newSettings.ratehawk) {
    updated.ratehawk = {
      ...current.ratehawk,
      ...newSettings.ratehawk,
      // Ensure keyId is set if partnerId is provided (backward compatibility)
      keyId: newSettings.ratehawk.keyId || newSettings.ratehawk.partnerId || current.ratehawk.keyId
    };
  }
  if (newSettings.stripe) {
    updated.stripe = { ...current.stripe, ...newSettings.stripe };
  }
  // Merge OAuth settings
  if (newSettings.oauth) {
    updated.oauth = {
      ...current.oauth,
      google: newSettings.oauth.google ? { ...current.oauth?.google, ...newSettings.oauth.google } : current.oauth?.google,
      facebook: newSettings.oauth.facebook ? { ...current.oauth?.facebook, ...newSettings.oauth.facebook } : current.oauth?.facebook
    };
  }
  // Merge email settings
  if (newSettings.email) {
    updated.email = { ...current.email, ...newSettings.email };
  }
  // Merge database settings
  if (newSettings.database) {
    updated.database = { ...current.database, ...newSettings.database };
  }
  // Merge general settings
  if (newSettings.general) {
    updated.general = { ...current.general, ...newSettings.general };
  }

  // Create a copy for storage to encrypt sensitive fields
  const storageSettings = JSON.parse(JSON.stringify(updated));

  if (storageSettings.ratehawk?.apiKey) {
    storageSettings.ratehawk.apiKey = encrypt(storageSettings.ratehawk.apiKey);
  }
  if (storageSettings.stripe?.secretKey) {
    storageSettings.stripe.secretKey = encrypt(storageSettings.stripe.secretKey);
  }
  if (storageSettings.stripe?.webhookSecret) {
    storageSettings.stripe.webhookSecret = encrypt(storageSettings.stripe.webhookSecret);
  }
  // Encrypt OAuth secrets
  if (storageSettings.oauth?.google?.clientSecret) {
    storageSettings.oauth.google.clientSecret = encrypt(storageSettings.oauth.google.clientSecret);
  }
  if (storageSettings.oauth?.facebook?.appSecret) {
    storageSettings.oauth.facebook.appSecret = encrypt(storageSettings.oauth.facebook.appSecret);
  }
  // Encrypt email password
  if (storageSettings.email?.smtpPassword) {
    storageSettings.email.smtpPassword = encrypt(storageSettings.email.smtpPassword);
  }
  // Encrypt MongoDB URL
  if (storageSettings.database?.mongodbUrl) {
    storageSettings.database.mongodbUrl = encrypt(storageSettings.database.mongodbUrl);
  }

  await fs.writeFile(SETTINGS_FILE, JSON.stringify(storageSettings, null, 2));

  // Return the decrypted version to the caller (admin UI)
  return updated;
}
