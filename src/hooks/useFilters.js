import { useState, useCallback } from 'react';

/**
 * Custom hook for managing property listing filters
 * Handles filter state and provides methods to update filters
 * 
 * @returns {Object} Filter state and methods
 */
const useFilters = () => {
  const [filters, setFilters] = useState({
    // Search parameters
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,

    // Suggested filters
    lastMinuteDeals: false,
    freeCancellation: false,
    payAtHotel: false,
    breakfastIncluded: false,
    breakfastLunchDinner: false,
    allMealsIncluded: false,

    // Price range
    priceMin: 0,
    priceMax: 1000,

    // Star rating
    starRating: [],

    // User rating
    userRating: [],

    // Property type
    propertyTypes: [],

    // Sort by
    sortBy: 'recommended',
  });

  /**
   * Update a single filter
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Toggle a checkbox filter
   */
  const toggleFilter = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  /**
   * Toggle array filter (for multi-select)
   */
  const toggleArrayFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray,
      };
    });
  }, []);

  /**
   * Update price range
   */
  const updatePriceRange = useCallback((min, max) => {
    setFilters((prev) => ({
      ...prev,
      priceMin: min,
      priceMax: max,
    }));
  }, []);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters({
      destination: '',
      checkIn: '',
      checkOut: '',
      guests: 2,
      rooms: 1,
      lastMinuteDeals: false,
      freeCancellation: false,
      payAtHotel: false,
      breakfastIncluded: false,
      breakfastLunchDinner: false,
      allMealsIncluded: false,
      priceMin: 0,
      priceMax: 1000,
      starRating: [],
      userRating: [],
      propertyTypes: [],
      sortBy: 'recommended',
    });
  }, []);

  /**
   * Get API query parameters from filters
   */
  const getQueryParams = useCallback(() => {
    const params = {};
    
    if (filters.destination) params.destination = filters.destination;
    if (filters.checkIn) params.checkIn = filters.checkIn;
    if (filters.checkOut) params.checkOut = filters.checkOut;
    if (filters.guests) params.guests = filters.guests;
    if (filters.rooms) params.rooms = filters.rooms;
    
    if (filters.lastMinuteDeals) params.lastMinute = true;
    if (filters.freeCancellation) params.freeCancellation = true;
    if (filters.payAtHotel) params.payAtHotel = true;
    if (filters.breakfastIncluded) params.breakfastIncluded = true;
    if (filters.breakfastLunchDinner) params.halfBoard = true;
    if (filters.allMealsIncluded) params.fullBoard = true;
    
    if (filters.priceMin > 0) params.priceMin = filters.priceMin;
    if (filters.priceMax < 1000) params.priceMax = filters.priceMax;
    
    if (filters.starRating.length > 0) params.stars = filters.starRating.join(',');
    if (filters.userRating.length > 0) params.rating = filters.userRating.join(',');
    if (filters.propertyTypes.length > 0) params.types = filters.propertyTypes.join(',');
    
    if (filters.sortBy) params.sortBy = filters.sortBy;
    
    return params;
  }, [filters]);

  return {
    filters,
    updateFilter,
    toggleFilter,
    toggleArrayFilter,
    updatePriceRange,
    resetFilters,
    getQueryParams,
  };
};

export default useFilters;
