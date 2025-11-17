import { API_CONFIG } from '../config/api';

/**
 * RapidAPI Authentication Service
 *
 * Simple authentication service for RapidAPI
 * RapidAPI uses API key authentication (no OAuth required)
 */

class RapidAPIAuthService {
  constructor() {
    this.apiKey = API_CONFIG.RAPIDAPI_KEY;
  }

  /**
   * Get RapidAPI key
   * @returns {string} API key
   * @throws {Error} If API key is not configured
   */
  getApiKey() {
    if (!this.apiKey || this.apiKey === 'your_rapidapi_key_here') {
      throw new Error(
        'RapidAPI key is not configured. Please:\n' +
        '1. Sign up at https://rapidapi.com/auth/sign-up\n' +
        '2. Get your API key from the dashboard\n' +
        '3. Add it to your .env file as VITE_RAPIDAPI_KEY'
      );
    }
    return this.apiKey;
  }

  /**
   * Get RapidAPI headers for requests
   * @param {string} host - The RapidAPI host for the specific service
   * @returns {Object} Headers object with API key
   */
  getAuthHeaders(host) {
    return {
      'X-RapidAPI-Key': this.getApiKey(),
      'X-RapidAPI-Host': host,
    };
  }

  /**
   * Check if API key is configured
   * @returns {boolean} True if API key is configured properly
   */
  isConfigured() {
    return !!(this.apiKey && this.apiKey !== 'your_rapidapi_key_here');
  }

  /**
   * Validate API key format (basic check)
   * @returns {boolean} True if format looks valid
   */
  isValidFormat() {
    if (!this.apiKey) return false;
    // RapidAPI keys are typically long alphanumeric strings
    return this.apiKey.length > 20 && this.apiKey !== 'your_rapidapi_key_here';
  }

  /**
   * Get configuration status
   * @returns {Object} Configuration status and message
   */
  getStatus() {
    if (!this.apiKey) {
      return {
        configured: false,
        valid: false,
        message: 'API key is missing. Please add VITE_RAPIDAPI_KEY to your .env file.',
      };
    }

    if (this.apiKey === 'your_rapidapi_key_here') {
      return {
        configured: false,
        valid: false,
        message: 'Please replace the placeholder API key with your actual RapidAPI key.',
      };
    }

    if (!this.isValidFormat()) {
      return {
        configured: true,
        valid: false,
        message: 'API key format looks incorrect. Please check your RapidAPI key.',
      };
    }

    return {
      configured: true,
      valid: true,
      message: 'RapidAPI is configured and ready to use.',
    };
  }
}

// Export singleton instance
const rapidAPIAuthService = new RapidAPIAuthService();
export default rapidAPIAuthService;
