/**
 * RapidAPI Configuration
 *
 * Universal API configuration for multiple travel services via RapidAPI
 * Documentation: https://rapidapi.com/hub
 *
 * Get your API key: https://rapidapi.com/auth/sign-up (Free tier available)
 */

export const API_CONFIG = {
  // RapidAPI Key (from environment variable)
  RAPIDAPI_KEY: import.meta.env.VITE_RAPIDAPI_KEY,

  // RapidAPI Host
  RAPIDAPI_HOST: import.meta.env.VITE_RAPIDAPI_HOST || 'rapidapi.com',

  // API Hosts for different services
  HOTELS_HOST: import.meta.env.VITE_HOTELS_API_HOST || 'booking-com.p.rapidapi.com',
  FLIGHTS_HOST: import.meta.env.VITE_FLIGHTS_API_HOST || 'skyscanner-flight-search.p.rapidapi.com',
  CARS_HOST: import.meta.env.VITE_CARS_API_HOST || 'rental-cars.p.rapidapi.com',
  ACTIVITIES_HOST: import.meta.env.VITE_ACTIVITIES_API_HOST || 'travel-advisor.p.rapidapi.com',
  CRUISES_HOST: import.meta.env.VITE_CRUISES_API_HOST || 'booking-com.p.rapidapi.com',

  // Timeout in milliseconds
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000,

  // Default settings
  DEFAULT_CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
  DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en_US',
};

/**
 * RapidAPI Endpoints
 * Each service uses different RapidAPI endpoints
 */
export const API_ENDPOINTS = {
  // ==================== HOTELS (Booking.com API v15) ====================
  // Base URL: https://booking-com15.p.rapidapi.com
  HOTEL_SEARCH: {
    url: '/api/v1/hotels/searchHotels',
    host: API_CONFIG.HOTELS_HOST,
    method: 'GET',
  },
  HOTEL_DETAILS: {
    url: '/api/v1/hotels/getHotelDetails',
    host: API_CONFIG.HOTELS_HOST,
    method: 'GET',
  },
  HOTEL_PHOTOS: {
    url: '/api/v1/hotels/getHotelPhotos',
    host: API_CONFIG.HOTELS_HOST,
    method: 'GET',
  },
  HOTEL_REVIEWS: {
    url: '/api/v1/hotels/getHotelReviews',
    host: API_CONFIG.HOTELS_HOST,
    method: 'GET',
  },
  HOTEL_FACILITIES: {
    url: '/api/v1/hotels/getHotelFacilities',
    host: API_CONFIG.HOTELS_HOST,
    method: 'GET',
  },
  LOCATION_SEARCH: {
    url: '/api/v1/hotels/searchDestination',
    host: API_CONFIG.HOTELS_HOST,
    method: 'GET',
  },

  // ==================== FLIGHTS (Skyscanner API) ====================
  // Base URL: https://skyscanner-flight-search.p.rapidapi.com
  FLIGHT_SEARCH: {
    url: '/v2/flights/search',
    host: API_CONFIG.FLIGHTS_HOST,
    method: 'POST',
  },
  FLIGHT_AUTOCOMPLETE: {
    url: '/v1/autosuggest/flights',
    host: API_CONFIG.FLIGHTS_HOST,
    method: 'GET',
  },
  FLIGHT_PRICES: {
    url: '/v1/flights/getPriceCalendar',
    host: API_CONFIG.FLIGHTS_HOST,
    method: 'GET',
  },

  // ==================== CAR RENTALS ====================
  // Base URL: https://rental-cars.p.rapidapi.com
  CAR_SEARCH: {
    url: '/search',
    host: API_CONFIG.CARS_HOST,
    method: 'GET',
  },
  CAR_LOCATIONS: {
    url: '/locations',
    host: API_CONFIG.CARS_HOST,
    method: 'GET',
  },

  // ==================== ACTIVITIES (Travel Advisor API) ====================
  // Base URL: https://travel-advisor.p.rapidapi.com
  ACTIVITIES_SEARCH: {
    url: '/attractions/list',
    host: API_CONFIG.ACTIVITIES_HOST,
    method: 'GET',
  },
  ACTIVITIES_DETAILS: {
    url: '/attractions/get-details',
    host: API_CONFIG.ACTIVITIES_HOST,
    method: 'GET',
  },
  LOCATION_AUTOCOMPLETE: {
    url: '/locations/auto-complete',
    host: API_CONFIG.ACTIVITIES_HOST,
    method: 'GET',
  },

  // ==================== CRUISES ====================
  // Using Booking.com API for cruise data as well
  CRUISE_SEARCH: {
    url: '/v1/cruises/search',
    host: API_CONFIG.CRUISES_HOST,
    method: 'GET',
  },
  CRUISE_DETAILS: {
    url: '/v1/cruises/data',
    host: API_CONFIG.CRUISES_HOST,
    method: 'GET',
  },

  // ==================== LOCAL BACKEND ENDPOINTS ====================
  // These would be your own backend API endpoints
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
};

/**
 * Get RapidAPI headers
 * @param {string} host - API host for the specific service
 * @param {Object} customHeaders - Additional custom headers
 * @returns {Object} Headers object for RapidAPI requests
 */
export const getRapidAPIHeaders = (host, customHeaders = {}) => {
  if (!API_CONFIG.RAPIDAPI_KEY || API_CONFIG.RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('RapidAPI key is not configured. Please set VITE_RAPIDAPI_KEY in your .env file.');
  }

  return {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
    'X-RapidAPI-Host': host,
    ...customHeaders,
  };
};

/**
 * Get full API URL for RapidAPI endpoints
 * @param {Object} endpoint - Endpoint object from API_ENDPOINTS
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // If it's a string endpoint (local backend), return as is
  if (typeof endpoint === 'string') {
    // This would be your local backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    return `${backendUrl}${endpoint}`;
  }

  // If it's a RapidAPI endpoint object
  if (endpoint.url && endpoint.host) {
    return `https://${endpoint.host}${endpoint.url}`;
  }

  throw new Error('Invalid endpoint configuration');
};

/**
 * Helper function to search hotels (Booking.com v15 API)
 * @param {Object} params - Search parameters
 * @returns {Object} Request configuration
 */
export const buildHotelSearchRequest = (params) => {
  const {
    destination = 'Paris',
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    rooms = 1,
    currency = API_CONFIG.DEFAULT_CURRENCY,
  } = params;

  return {
    url: getApiUrl(API_ENDPOINTS.HOTEL_SEARCH),
    headers: getRapidAPIHeaders(API_CONFIG.HOTELS_HOST),
    params: {
      dest_type: 'city',
      search_query: destination,
      arrival_date: checkIn, // Format: YYYY-MM-DD
      departure_date: checkOut, // Format: YYYY-MM-DD
      adults: adults,
      children_age: children > 0 ? '0' : '',
      room_qty: rooms,
      units: 'metric',
      temperature_unit: 'c',
      currency_code: currency,
      languagecode: 'en-us',
    },
  };
};

/**
 * Helper function to search flights
 * @param {Object} params - Search parameters
 * @returns {Object} Request configuration
 */
export const buildFlightSearchRequest = (params) => {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    cabinClass = 'economy',
    currency = API_CONFIG.DEFAULT_CURRENCY,
  } = params;

  return {
    url: getApiUrl(API_ENDPOINTS.FLIGHT_SEARCH),
    headers: getRapidAPIHeaders(API_CONFIG.FLIGHTS_HOST),
    data: {
      origin,
      destination,
      date: departureDate, // Format: YYYY-MM-DD
      returnDate, // Optional, for round trip
      adults,
      cabinClass,
      currency,
    },
  };
};

/**
 * Helper function to search cars
 * @param {Object} params - Search parameters
 * @returns {Object} Request configuration
 */
export const buildCarSearchRequest = (params) => {
  const {
    pickupLocation,
    dropoffLocation,
    pickupDate,
    dropoffDate,
    driverAge = 30,
    currency = API_CONFIG.DEFAULT_CURRENCY,
  } = params;

  return {
    url: getApiUrl(API_ENDPOINTS.CAR_SEARCH),
    headers: getRapidAPIHeaders(API_CONFIG.CARS_HOST),
    params: {
      pick_up_location: pickupLocation,
      drop_off_location: dropoffLocation || pickupLocation,
      pick_up_date: pickupDate, // Format: YYYY-MM-DD
      drop_off_date: dropoffDate, // Format: YYYY-MM-DD
      driver_age: driverAge,
      currency,
    },
  };
};

/**
 * Helper function to search activities
 * @param {Object} params - Search parameters
 * @returns {Object} Request configuration
 */
export const buildActivitiesSearchRequest = (params) => {
  const {
    locationId,
    currency = API_CONFIG.DEFAULT_CURRENCY,
    lang = 'en_US',
    limit = 30,
  } = params;

  return {
    url: getApiUrl(API_ENDPOINTS.ACTIVITIES_SEARCH),
    headers: getRapidAPIHeaders(API_CONFIG.ACTIVITIES_HOST),
    params: {
      location_id: locationId,
      currency,
      lang,
      lunit: 'km',
      limit,
    },
  };
};

/**
 * Helper function for location autocomplete
 * @param {string} query - Search query
 * @returns {Object} Request configuration
 */
export const buildLocationAutocompleteRequest = (query) => {
  return {
    url: getApiUrl(API_ENDPOINTS.LOCATION_AUTOCOMPLETE),
    headers: getRapidAPIHeaders(API_CONFIG.ACTIVITIES_HOST),
    params: {
      query,
      lang: API_CONFIG.DEFAULT_LANGUAGE,
    },
  };
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  getApiUrl,
  getRapidAPIHeaders,
  buildHotelSearchRequest,
  buildFlightSearchRequest,
  buildCarSearchRequest,
  buildActivitiesSearchRequest,
  buildLocationAutocompleteRequest,
};
