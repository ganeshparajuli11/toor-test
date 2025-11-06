/**
 * API Configuration
 *
 * Amadeus API Configuration for travel data
 * Documentation: https://developers.amadeus.com/
 */

export const API_CONFIG = {
  // Base URL for Amadeus API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://test.api.amadeus.com',

  // API Version
  VERSION: import.meta.env.VITE_API_VERSION || 'v2',

  // Timeout in milliseconds
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000,

  // Amadeus API Credentials
  API_KEY: import.meta.env.VITE_API_KEY,
  API_SECRET: import.meta.env.VITE_API_SECRET,

  // OAuth2 Configuration
  AUTH_URL: import.meta.env.VITE_AMADEUS_AUTH_URL || 'https://test.api.amadeus.com/v1/security/oauth2/token',
  GRANT_TYPE: import.meta.env.VITE_AMADEUS_GRANT_TYPE || 'client_credentials',
};

/**
 * Amadeus API Endpoints
 *
 * Documentation: https://developers.amadeus.com/self-service/apis-docs
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH_TOKEN: '/v1/security/oauth2/token',

  // Hotels & Accommodation
  HOTEL_SEARCH: '/v3/shopping/hotel-offers',
  HOTEL_OFFERS: '/v3/shopping/hotel-offers/by-hotel',
  HOTEL_BOOKING: '/v2/booking/hotel-bookings',
  HOTEL_RATINGS: '/v2/e-reputation/hotel-sentiments',

  // Flights
  FLIGHT_OFFERS_SEARCH: '/v2/shopping/flight-offers',
  FLIGHT_OFFERS_PRICE: '/v1/shopping/flight-offers/pricing',
  FLIGHT_CREATE_ORDER: '/v1/booking/flight-orders',
  FLIGHT_INSPIRATION_SEARCH: '/v1/shopping/flight-destinations',
  FLIGHT_CHEAPEST_DATE: '/v1/shopping/flight-dates',
  AIRPORT_ROUTES: '/v1/airport/direct-destinations',

  // Car Rental
  CAR_RENTAL_SEARCH: '/v1/shopping/car-rentals',
  CAR_RENTAL_OFFERS: '/v1/shopping/car-rental-offers',

  // Activities & Tours
  ACTIVITIES: '/v1/shopping/activities',
  ACTIVITIES_BY_SQUARE: '/v1/shopping/activities/by-square',

  // Location & Reference Data
  AIRPORT_CITY_SEARCH: '/v1/reference-data/locations',
  AIRPORT_NEAREST: '/v1/reference-data/locations/airports',
  AIRLINE_CODE_LOOKUP: '/v1/reference-data/airlines',

  // Travel Recommendations
  POINTS_OF_INTEREST: '/v1/reference-data/locations/pois',
  SAFE_PLACE: '/v1/safety/safety-rated-locations',

  // Trip Parser (for extracting booking data)
  TRIP_PARSER: '/v3/travel/trip-parser',

  // Local Backend Endpoints (if you have your own)
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

  // Additional Content
  ARTICLES: '/blog/articles',
  TEAM: '/team/members',

  // Reviews
  PROPERTY_REVIEWS: '/properties/:id/reviews',
  PROPERTY_ADD_REVIEW: '/properties/:id/reviews',
};

/**
 * Get full API URL
 * @param {string} endpoint - Endpoint from API_ENDPOINTS
 * @param {Object} params - URL parameters to replace (e.g., {id: 123})
 * @param {boolean} isAmadeusAPI - Whether this is an Amadeus API endpoint (default: true)
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint, params = {}, isAmadeusAPI = true) => {
  let url;

  if (isAmadeusAPI) {
    // Amadeus API endpoints already include version in the path
    url = `${API_CONFIG.BASE_URL}${endpoint}`;
  } else {
    // Local backend endpoints
    url = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}${endpoint}`;
  }

  // Replace URL parameters like :id with actual values
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  return url;
};
