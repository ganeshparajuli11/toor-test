import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

/**
 * Fallback demo data for property listings
 */
const FALLBACK_PROPERTIES = [
  {
    id: 1,
    name: 'Effotel By Sayaji Jaipur',
    location: 'Jaipur, India',
    rating: 4.5,
    reviewCount: 371,
    price: 140,
    originalPrice: 180,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    amenities: ['20+ Amenities'],
    stars: 4,
    propertyType: 'Hotel',
  },
  {
    id: 2,
    name: 'Effotel By Sayaji Jaipur',
    location: 'Jaipur, India',
    rating: 4.5,
    reviewCount: 371,
    price: 440,
    originalPrice: 500,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    amenities: ['20+ Amenities'],
    stars: 5,
    propertyType: 'Hotel',
  },
  {
    id: 3,
    name: 'Effotel By Sayaji Jaipur',
    location: 'Jaipur, India',
    rating: 4.5,
    reviewCount: 371,
    price: 260,
    originalPrice: 300,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    amenities: ['20+ Amenities'],
    stars: 4,
    propertyType: 'Resort',
  },
  {
    id: 4,
    name: 'Effotel By Sayaji Jaipur',
    location: 'Jaipur, India',
    rating: 4.5,
    reviewCount: 371,
    price: 50,
    originalPrice: 70,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    amenities: ['20+ Amenities'],
    stars: 3,
    propertyType: 'Hotel',
  },
  {
    id: 5,
    name: 'Effotel By Sayaji Jaipur',
    location: 'Jaipur, India',
    rating: 4.5,
    reviewCount: 371,
    price: 890,
    originalPrice: 1000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    amenities: ['20+ Amenities'],
    stars: 5,
    propertyType: 'Villa',
  },
  {
    id: 6,
    name: 'Effotel By Sayaji Jaipur',
    location: 'Jaipur, India',
    rating: 4.5,
    reviewCount: 371,
    price: 260,
    originalPrice: 300,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    amenities: ['20+ Amenities'],
    stars: 4,
    propertyType: 'Resort',
  },
];

/**
 * Custom hook for fetching property listings with filters
 * 
 * @param {Object} queryParams - Query parameters for API call
 * @returns {Object} Listings data, loading state, error, and methods
 */
const useListings = (queryParams = {}) => {
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  /**
   * Fetch properties from API
   */
  const fetchProperties = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(API_ENDPOINTS.PROPERTIES_SEARCH);
      const response = await axios.get(url, {
        params: {
          ...queryParams,
          page: pageNum,
          limit: 10,
        },
      });

      const data = response.data.data || response.data.properties || response.data;
      const total = response.data.total || response.data.totalCount || data.length;

      if (append) {
        setProperties((prev) => [...prev, ...data]);
      } else {
        setProperties(data);
      }

      setTotalCount(total);
      setHasMore(data.length === 10);
      setIsUsingFallback(false);
      setLoading(false);
    } catch (err) {
      console.warn('API Error, using fallback data:', err.message);
      
      // Use fallback data
      if (!append) {
        setProperties(FALLBACK_PROPERTIES);
        setTotalCount(FALLBACK_PROPERTIES.length);
        setHasMore(false);
        setIsUsingFallback(true);
      }
      
      setError(null); // Don't show error when using fallback
      setLoading(false);
    }
  }, [queryParams]);

  /**
   * Load more properties (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProperties(nextPage, true);
    }
  }, [loading, hasMore, page, fetchProperties]);

  /**
   * Refresh properties
   */
  const refresh = useCallback(() => {
    setPage(1);
    fetchProperties(1, false);
  }, [fetchProperties]);

  // Fetch properties on mount and when queryParams change
  useEffect(() => {
    setPage(1);
    fetchProperties(1, false);
  }, [fetchProperties]);

  return {
    properties,
    totalCount,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isUsingFallback,
  };
};

export default useListings;
