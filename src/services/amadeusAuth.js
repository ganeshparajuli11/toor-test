import axios from 'axios';
import { API_CONFIG } from '../config/api';

/**
 * Amadeus Authentication Service
 * Handles OAuth2 token management for Amadeus API
 */

class AmadeusAuthService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null;
  }

  /**
   * Get access token from Amadeus OAuth2 endpoint
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // If token exists and is not expired, return it
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // If a token request is already in progress, wait for it
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Request new token
    this.tokenPromise = this.requestNewToken();

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Request new access token from Amadeus
   * @returns {Promise<string>} Access token
   */
  async requestNewToken() {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', API_CONFIG.GRANT_TYPE);
      params.append('client_id', API_CONFIG.API_KEY);
      params.append('client_secret', API_CONFIG.API_SECRET);

      const response = await axios.post(API_CONFIG.AUTH_URL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, expires_in } = response.data;

      // Store token and calculate expiry (subtract 60 seconds for buffer)
      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + (expires_in - 60) * 1000;

      return access_token;
    } catch (error) {
      console.error('Amadeus authentication error:', error);
      throw new Error(
        error.response?.data?.error_description ||
          'Failed to authenticate with Amadeus API'
      );
    }
  }

  /**
   * Clear stored token (useful for logout or token refresh)
   */
  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null;
  }

  /**
   * Check if token is valid
   * @returns {boolean} True if token exists and is not expired
   */
  isTokenValid() {
    return !!(
      this.accessToken &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry
    );
  }
}

// Export singleton instance
const amadeusAuthService = new AmadeusAuthService();
export default amadeusAuthService;
