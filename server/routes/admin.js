import express from 'express';
import { getSettings, saveSettings } from '../config/store.js';

const router = express.Router();

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await getSettings();
        // Don't return sensitive secrets in full if needed, but for this admin panel we might need them to edit
        // For security in production, we might mask them or only return them if authenticated
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

// POST /api/admin/settings
router.post('/settings', async (req, res) => {
    try {
        const updatedSettings = await saveSettings(req.body);
        res.json({ success: true, settings: updatedSettings });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ message: 'Failed to save settings' });
    }
});

export default router;
