import express from 'express';
import axios from 'axios';
import { getSettings } from '../config/store.js';

const router = express.Router();

const BASE_URLS = {
    sandbox: 'https://api.worldota.net/api/b2b/v3',
    production: 'https://api.worldota.net/api/b2b/v3'
};

// Middleware to inject RateHawk credentials
const rateHawkProxy = async (req, res) => {
    try {
        const settings = await getSettings();
        const { apiKey, environment } = settings.ratehawk;

        if (!apiKey) {
            return res.status(400).json({ message: 'RateHawk API Key not configured' });
        }

        const baseURL = BASE_URLS[environment] || BASE_URLS.sandbox;
        const endpoint = req.params[0]; // Captured by wildcard
        const url = `${baseURL}/${endpoint.replace(/^\//, '')}`; // Remove potential double slashes

        // RateHawk uses Basic Auth with Key_ID:API_Key
        const authHeader = settings.ratehawk.keyId
            ? `Basic ${Buffer.from(`${settings.ratehawk.keyId}:${apiKey}`).toString('base64')}`
            : `Bearer ${apiKey}`;

        console.log(`[Proxy] Request: ${req.method} ${url}`);
        console.log(`[Proxy] Auth Header Length: ${authHeader.length}`);
        console.log(`[Proxy] KeyID present: ${!!settings.ratehawk.keyId}`);

        const response = await axios({
            method: req.method,
            url: url,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('RateHawk Proxy Error:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Proxy request failed', error: error.message });
        }
    }
};

// Match all routes under /ratehawk/
router.all('/ratehawk/*', rateHawkProxy);

export default router;
