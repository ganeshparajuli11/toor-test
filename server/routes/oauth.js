import express from 'express';
import { getSettings } from '../config/store.js';

const router = express.Router();

/**
 * Get OAuth configuration (public - only returns enabled status and client IDs)
 */
router.get('/config', async (req, res) => {
  try {
    const settings = await getSettings();

    // Only return public OAuth info (no secrets)
    const oauthConfig = {
      google: {
        enabled: settings.oauth?.google?.enabled || false,
        clientId: settings.oauth?.google?.clientId || ''
      },
      facebook: {
        enabled: settings.oauth?.facebook?.enabled || false,
        appId: settings.oauth?.facebook?.appId || ''
      }
    };

    res.json({ success: true, data: oauthConfig });
  } catch (error) {
    console.error('Error getting OAuth config:', error);
    res.status(500).json({ success: false, message: 'Failed to get OAuth configuration' });
  }
});

/**
 * Google OAuth callback handler
 * Exchanges authorization code for access token and user info
 */
router.post('/google/callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is required' });
    }

    const settings = await getSettings();
    const { clientId, clientSecret, enabled } = settings.oauth?.google || {};

    if (!enabled || !clientId || !clientSecret) {
      return res.status(400).json({ success: false, message: 'Google OAuth is not configured' });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token error:', tokenData);
      return res.status(400).json({ success: false, message: tokenData.error_description || 'Failed to exchange code' });
    }

    // Get user info using the access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();

    if (userData.error) {
      return res.status(400).json({ success: false, message: 'Failed to get user info' });
    }

    // Return user data to the frontend
    res.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        provider: 'google'
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ success: false, message: 'OAuth authentication failed' });
  }
});

/**
 * Facebook OAuth callback handler
 * Exchanges authorization code for access token and user info
 */
router.post('/facebook/callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is required' });
    }

    const settings = await getSettings();
    const { appId, appSecret, enabled } = settings.oauth?.facebook || {};

    if (!enabled || !appId || !appSecret) {
      return res.status(400).json({ success: false, message: 'Facebook OAuth is not configured' });
    }

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.append('client_id', appId);
    tokenUrl.searchParams.append('client_secret', appSecret);
    tokenUrl.searchParams.append('redirect_uri', redirectUri);
    tokenUrl.searchParams.append('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Facebook token error:', tokenData);
      return res.status(400).json({ success: false, message: tokenData.error.message || 'Failed to exchange code' });
    }

    // Get user info using the access token
    const userUrl = new URL('https://graph.facebook.com/me');
    userUrl.searchParams.append('fields', 'id,name,email,picture.type(large)');
    userUrl.searchParams.append('access_token', tokenData.access_token);

    const userResponse = await fetch(userUrl.toString());
    const userData = await userResponse.json();

    if (userData.error) {
      return res.status(400).json({ success: false, message: 'Failed to get user info' });
    }

    // Return user data to the frontend
    res.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email || '',
        name: userData.name,
        picture: userData.picture?.data?.url || '',
        provider: 'facebook'
      }
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({ success: false, message: 'OAuth authentication failed' });
  }
});

export default router;
