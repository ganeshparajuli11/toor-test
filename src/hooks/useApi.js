import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

/**
 * Custom hook for API data fetching with caching
 *
 * @param {string} endpoint - API endpoint from API_ENDPOINTS
 * @param {Object} options - Additional options
 * @param {boolean} options.immediate - Whether to fetch immediately on mount
 * @param {Object} options.params - Query parameters
 * @param {Array} options.dependencies - Dependencies for re-fetching
 * @returns {Object} { data, loading, error, refetch }
 */
const useApi = (endpoint, options = {}) => {
  const {
    immediate = true,
    params = {},
    dependencies = [],
    cacheKey = endpoint,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
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
    // Check cache first
    const cachedData = cache();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(endpoint);
      const response = await axios.get(url, { params });

      setData(response.data);
      setCache(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error('API Error:', err);
      return null;
    }
  }, [endpoint, params, cache, setCache]);

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
