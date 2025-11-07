import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import rateHawkAuthService from '../services/amadeusAuth';

/**
 * Custom hook for API data fetching with caching and RateHawk authentication
 *
 * @param {string} endpoint - API endpoint from API_ENDPOINTS
 * @param {Object} options - Additional options
 * @param {boolean} options.immediate - Whether to fetch immediately on mount
 * @param {Object} options.params - Query parameters
 * @param {Array} options.dependencies - Dependencies for re-fetching
 * @param {boolean} options.isRateHawkAPI - Whether this is a RateHawk API call (default: true)
 * @param {string} options.method - HTTP method (default: 'GET')
 * @param {Object} options.body - Request body for POST/PUT requests
 * @returns {Object} { data, loading, error, refetch }
 */
const useApi = (endpoint, options = {}) => {
  const {
    immediate = true,
    params = {},
    dependencies = [],
    cacheKey = endpoint,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
    isRateHawkAPI = true,
    method = 'GET',
    body = null,
  } = options;

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
      const url = getApiUrl(endpoint, {}, isRateHawkAPI);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add RateHawk authentication if this is a RateHawk API call
      if (isRateHawkAPI) {
        try {
          const authHeader = rateHawkAuthService.getAuthorizationHeader();
          headers['Authorization'] = authHeader;
        } catch (authError) {
          throw new Error('Authentication failed: ' + authError.message);
        }
      }

      // Make API request based on method
      let response;
      if (method === 'GET') {
        response = await axios.get(url, { params, headers });
      } else if (method === 'POST') {
        response = await axios.post(url, body, { params, headers });
      } else if (method === 'PUT') {
        response = await axios.put(url, body, { params, headers });
      } else if (method === 'DELETE') {
        response = await axios.delete(url, { params, headers });
      }

      setData(response.data);

      // Cache only GET requests
      if (method === 'GET') {
        setCache(response.data);
      }

      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.detail ||
        err.response?.data?.message ||
        err.message ||
        'An error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error('API Error:', err);
      return null;
    }
  }, [endpoint, params, body, method, isRateHawkAPI, cache, setCache]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useApi;
