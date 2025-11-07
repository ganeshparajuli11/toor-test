import { API_CONFIG } from '../config/api';

/**
 * RateHawk Authentication Service
 * Handles API key authentication for RateHawk API
 */

class RateHawkAuthService {
  constructor() {
    this.apiKey = API_CONFIG.API_KEY;
  }

  /**
   * Get API key for RateHawk authentication
   * @returns {string} API key
   */
  getApiKey() {
    if (!this.apiKey) {
      throw new Error('RateHawk API key is not configured. Please check your .env file.');
    }
    return this.apiKey;
  }

  /**
   * Get authorization header for RateHawk API
   * @returns {string} Bearer token string
   */
  getAuthorizationHeader() {
    return `Bearer ${this.getApiKey()}`;
  }

  /**
   * Check if API key is configured
   * @returns {boolean} True if API key exists
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

// Export singleton instance
const rateHawkAuthService = new RateHawkAuthService();
export default rateHawkAuthService;
