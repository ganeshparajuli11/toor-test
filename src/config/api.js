/**
 * API Configuration
 *
 * Update these endpoints to connect to your backend API
 * All API calls throughout the application use these base URLs
 */

export const API_CONFIG = {
  // Base URL for your API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',

  // API Version
  VERSION: 'v1',

  // Timeout in milliseconds
  TIMEOUT: 30000,
};

/**
 * API Endpoints
 *
 * Update these paths according to your backend API structure
 */
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Social Authentication
  GOOGLE_AUTH: '/auth/google',
  FACEBOOK_AUTH: '/auth/facebook',

  // User
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/update',
  USER_BOOKINGS: '/users/:id/bookings',

  // Newsletter
  NEWSLETTER_SUBSCRIBE: '/newsletter/subscribe',

  // Travel Data
  HOTELS: '/travel/hotels',
  FLIGHTS: '/travel/flights',
  CRUISES: '/travel/cruises',
  CARS: '/travel/cars',
  ARTICLES: '/blog/articles',
  TEAM: '/team/members',

  // Property Listings
  PROPERTIES_SEARCH: '/properties/search',
  PROPERTIES_FILTERS: '/properties/filters',
  PROPERTY_DETAILS: '/properties/:id',
  PROPERTY_AVAILABILITY: '/properties/:id/availability',
  PROPERTY_AMENITIES: '/properties/amenities',
  PROPERTY_REVIEWS: '/properties/:id/reviews',
  PROPERTY_ADD_REVIEW: '/properties/:id/reviews',

  // Bookings
  BOOKING_DETAILS: '/bookings/:id',
  BOOKING_CREATE: '/bookings',
  APPLY_COUPON: '/bookings/coupon',
  CANCEL_BOOKING: '/bookings/:id/cancel',
};

/**
 * Get full API URL
 * @param {string} endpoint - Endpoint from API_ENDPOINTS
 * @param {Object} params - URL parameters to replace (e.g., {id: 123})
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}${endpoint}`;

  // Replace URL parameters like :id with actual values
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  return url;
};
