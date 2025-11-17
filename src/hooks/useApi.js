import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl, getRapidAPIHeaders } from '../config/api';
import rapidAPIAuthService from '../services/amadeusAuth';

/**
 * Custom hook for API data fetching with caching and RapidAPI authentication
 *
 * @param {Object|string} endpoint - API endpoint from API_ENDPOINTS (object for RapidAPI, string for local backend)
 * @param {Object} options - Additional options
 * @param {boolean} options.immediate - Whether to fetch immediately on mount (default: true)
 * @param {Object} options.params - Query parameters
 * @param {Array} options.dependencies - Dependencies for re-fetching
 * @param {boolean} options.isRapidAPI - Whether this is a RapidAPI call (default: true for object endpoints)
 * @param {string} options.method - HTTP method (overrides endpoint.method)
 * @param {Object} options.body - Request body for POST/PUT requests
 * @param {number} options.cacheTime - Cache duration in milliseconds (default: 5 minutes)
 * @returns {Object} { data, loading, error, refetch }
 */
const useApi = (endpoint, options = {}) => {
  const {
    immediate = true,
    params = {},
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
    isRapidAPI = typeof endpoint === 'object', // Auto-detect based on endpoint type
    method = endpoint?.method || 'GET',
    body = null,
  } = options;

  // Generate cache key from endpoint
  const cacheKey = typeof endpoint === 'string'
    ? endpoint
    : `${endpoint?.host}${endpoint?.url}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Simple in-memory cache
  const cache = useCallback(() => {
    const cacheData = sessionStorage.getItem(`api_cache_${cacheKey}`);
    if (cacheData) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cacheData);
        if (Date.now() - timestamp < cacheTime) {
          return cachedData;
        }
      } catch (e) {
        sessionStorage.removeItem(`api_cache_${cacheKey}`);
      }
    }
    return null;
  }, [cacheKey, cacheTime]);

  const setCache = useCallback(
    (data) => {
      try {
        sessionStorage.setItem(
          `api_cache_${cacheKey}`,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (e) {
        console.warn('Failed to cache data:', e);
      }
    },
    [cacheKey]
  );

  const fetchData = useCallback(async () => {
    // Check cache first (only for GET requests)
    if (method === 'GET') {
      const cachedData = cache();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(endpoint);

      // Prepare headers
      let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add RapidAPI authentication if this is a RapidAPI call
      if (isRapidAPI && typeof endpoint === 'object') {
        try {
          const rapidAPIHeaders = rapidAPIAuthService.getAuthHeaders(endpoint.host);
          headers = { ...headers, ...rapidAPIHeaders };
        } catch (authError) {
          throw new Error('Authentication failed: ' + authError.message);
        }
      }

      // Make API request based on method
      let response;
      const requestConfig = { headers, timeout: 30000 };

      switch (method.toUpperCase()) {
        case 'GET':
          response = await axios.get(url, { ...requestConfig, params });
          break;
        case 'POST':
          response = await axios.post(url, body, { ...requestConfig, params });
          break;
        case 'PUT':
          response = await axios.put(url, body, { ...requestConfig, params });
          break;
        case 'DELETE':
          response = await axios.delete(url, { ...requestConfig, params });
          break;
        case 'PATCH':
          response = await axios.patch(url, body, { ...requestConfig, params });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      setData(response.data);

      // Cache only GET requests
      if (method === 'GET') {
        setCache(response.data);
      }

      setLoading(false);
      return response.data;
    } catch (err) {
      // Enhanced error handling for different API error formats
      let errorMessage = 'An error occurred';

      if (err.response) {
        // Server responded with error
        const errorData = err.response.data;

        // RapidAPI error format
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Amadeus/other API error format
        else if (errorData.errors && errorData.errors[0]) {
          errorMessage = errorData.errors[0].detail || errorData.errors[0].title;
        }
        // Generic error format
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        // HTTP status message
        else {
          errorMessage = `API Error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (err.message) {
        // Request setup error
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
      console.error('API Error:', err);
      console.error('Error details:', {
        url: getApiUrl(endpoint),
        method,
        params,
        body,
        error: errorMessage,
      });
      return null;
    }
  }, [endpoint, params, body, method, isRapidAPI, cache, setCache]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useApi;
