import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.service';

/**
 * Custom hook for OAuth authentication
 * Handles Google and Facebook OAuth flows
 */
const useOAuth = () => {
  const [oauthConfig, setOauthConfig] = useState({
    google: { enabled: false, clientId: '' },
    facebook: { enabled: false, appId: '' }
  });
  const [loading, setLoading] = useState(true);

  // Load OAuth configuration from server
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await api.get('/oauth/config');
        if (response.data.success) {
          setOauthConfig(response.data.data);
        }
      } catch (error) {
        console.error('Error loading OAuth config:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  /**
   * Initiate Google OAuth flow
   */
  const loginWithGoogle = useCallback(() => {
    if (!oauthConfig.google.enabled || !oauthConfig.google.clientId) {
      return { success: false, message: 'Google login is not configured' };
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'email profile';
    const responseType = 'code';

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', oauthConfig.google.clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', responseType);
    googleAuthUrl.searchParams.append('scope', scope);
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'consent');

    // Store redirect URI for callback
    sessionStorage.setItem('oauth_redirect_uri', redirectUri);
    sessionStorage.setItem('oauth_provider', 'google');

    // Redirect to Google OAuth
    window.location.href = googleAuthUrl.toString();
    return { success: true };
  }, [oauthConfig.google]);

  /**
   * Initiate Facebook OAuth flow
   */
  const loginWithFacebook = useCallback(() => {
    if (!oauthConfig.facebook.enabled || !oauthConfig.facebook.appId) {
      return { success: false, message: 'Facebook login is not configured' };
    }

    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const scope = 'email,public_profile';

    const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    facebookAuthUrl.searchParams.append('client_id', oauthConfig.facebook.appId);
    facebookAuthUrl.searchParams.append('redirect_uri', redirectUri);
    facebookAuthUrl.searchParams.append('scope', scope);
    facebookAuthUrl.searchParams.append('response_type', 'code');

    // Store redirect URI for callback
    sessionStorage.setItem('oauth_redirect_uri', redirectUri);
    sessionStorage.setItem('oauth_provider', 'facebook');

    // Redirect to Facebook OAuth
    window.location.href = facebookAuthUrl.toString();
    return { success: true };
  }, [oauthConfig.facebook]);

  /**
   * Handle OAuth callback - exchange code for user info
   */
  const handleOAuthCallback = useCallback(async (code, provider) => {
    try {
      const redirectUri = sessionStorage.getItem('oauth_redirect_uri');

      const response = await api.post(`/oauth/${provider}/callback`, {
        code,
        redirectUri
      });

      // Clear session storage
      sessionStorage.removeItem('oauth_redirect_uri');
      sessionStorage.removeItem('oauth_provider');

      if (response.data.success) {
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.data.message || 'OAuth authentication failed' };
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { success: false, message: error.response?.data?.message || 'OAuth authentication failed' };
    }
  }, []);

  return {
    oauthConfig,
    loading,
    loginWithGoogle,
    loginWithFacebook,
    handleOAuthCallback,
    isGoogleEnabled: oauthConfig.google.enabled && !!oauthConfig.google.clientId,
    isFacebookEnabled: oauthConfig.facebook.enabled && !!oauthConfig.facebook.appId
  };
};

export default useOAuth;
