/**
 * RateHawk API Configuration
 *
 * Universal API configuration for RateHawk travel services
 * Documentation: https://www.ratehawk.com/lp/en-us/API/
 * Support: [email protected]
 */

export const API_CONFIG = {
  // Base URL for RateHawk API
  BASE_URL: import.meta.env.VITE_RATEHAWK_BASE_URL || 'https://api.ratehawk.com',

  // API Version
  VERSION: import.meta.env.VITE_RATEHAWK_VERSION || 'v3',

  // Timeout in milliseconds
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000,

  // RateHawk API Key (from environment variable)
  API_KEY: import.meta.env.VITE_API_KEY,

  // Default language for API responses (supports 32 languages)
  DEFAULT_LANGUAGE: import.meta.env.VITE_RATEHAWK_LANGUAGE || 'en',

  // Currency code
  DEFAULT_CURRENCY: import.meta.env.VITE_RATEHAWK_CURRENCY || 'USD',
};

/**
 * RateHawk API Endpoints
 *
 * Workflow: Hotel Static -> SERP -> Prebook -> Order Booking -> Order Finish -> Order Status
 */
export const API_ENDPOINTS = {
  // Hotels & Accommodation
  HOTEL_SEARCH: '/hotels/search', // SERP (Search Engine Results Page)
  HOTEL_STATIC: '/hotels/static', // Hotel static data
  HOTEL_PREBOOK: '/hotels/prebook', // Pre-booking validation
  HOTEL_BOOKING: '/hotels/order/booking', // Create booking
  HOTEL_ORDER_FINISH: '/hotels/order/finish', // Finish order
  HOTEL_ORDER_STATUS: '/hotels/order/status', // Check order status
  HOTEL_ORDER_INFO: '/hotels/order/info', // Get order information
  HOTEL_ORDER_CANCEL: '/hotels/order/cancel', // Cancel order
  HOTEL_REVIEWS: '/hotels/reviews', // Hotel reviews
  HOTEL_CONTENT: '/hotels/content', // Hotel content/details

  // Flights (if available)
  FLIGHT_SEARCH: '/flights/search',
  FLIGHT_BOOKING: '/flights/booking',
  FLIGHT_ORDER_STATUS: '/flights/order/status',
  FLIGHT_ORDER_CANCEL: '/flights/order/cancel',

  // Car Rentals (if available)
  CAR_SEARCH: '/cars/search',
  CAR_BOOKING: '/cars/booking',

  // Cruises (if available)
  CRUISE_SEARCH: '/cruises/search',
  CRUISE_BOOKING: '/cruises/booking',

  // Reference Data
  LOCATIONS: '/locations', // Location search/autocomplete
  REGIONS: '/regions', // Region data
  COUNTRIES: '/countries', // Country data

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
 * Get full RateHawk API URL
 * @param {string} endpoint - Endpoint from API_ENDPOINTS
 * @param {Object} params - URL parameters to replace (e.g., {id: 123})
 * @param {boolean} isRateHawkAPI - Whether this is a RateHawk API endpoint (default: true)
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint, params = {}, isRateHawkAPI = true) => {
  let url;

  if (isRateHawkAPI) {
    // RateHawk API endpoints
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

/**
 * Get RateHawk API headers
 * @param {Object} customHeaders - Additional custom headers
 * @returns {Object} Headers object for API requests
 */
export const getApiHeaders = (customHeaders = {}) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
    'Accept': 'application/json',
    'Accept-Language': API_CONFIG.DEFAULT_LANGUAGE,
    ...customHeaders,
  };
};

/**
 * Make RateHawk API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    params = {},
    data = null,
    headers = {},
    isRateHawkAPI = true,
  } = options;

  const url = getApiUrl(endpoint, params, isRateHawkAPI);
  const requestHeaders = getApiHeaders(headers);

  try {
    const requestOptions = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    };

    // Add query parameters for GET requests
    if (method === 'GET' && data) {
      const queryParams = new URLSearchParams(data);
      const fullUrl = `${url}?${queryParams.toString()}`;
      const response = await fetch(fullUrl, requestOptions);
      return handleResponse(response);
    }

    // Add body for POST/PUT requests
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);
    return handleResponse(response);
  } catch (error) {
    console.error('RateHawk API Error:', error);
    throw error;
  }
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed response data
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      `API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Hotel search helper function
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Hotel search results
 */
export const searchHotels = async (searchParams) => {
  const {
    location,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    rooms = 1,
    currency = API_CONFIG.DEFAULT_CURRENCY,
    language = API_CONFIG.DEFAULT_LANGUAGE,
  } = searchParams;

  return apiRequest(API_ENDPOINTS.HOTEL_SEARCH, {
    method: 'POST',
    data: {
      location,
      checkin: checkIn,
      checkout: checkOut,
      adults,
      children,
      rooms,
      currency,
      language,
    },
  });
};

/**
 * Get hotel details
 * @param {string} hotelId - Hotel ID
 * @returns {Promise<Object>} Hotel details
 */
export const getHotelDetails = async (hotelId) => {
  return apiRequest(API_ENDPOINTS.HOTEL_CONTENT, {
    method: 'GET',
    data: { hotel_id: hotelId },
  });
};

/**
 * Pre-book hotel (validate availability and price)
 * @param {string} bookHash - Booking hash from search results
 * @returns {Promise<Object>} Pre-booking details
 */
export const prebookHotel = async (bookHash) => {
  return apiRequest(API_ENDPOINTS.HOTEL_PREBOOK, {
    method: 'POST',
    data: { book_hash: bookHash },
  });
};
