import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import useApi from './useApi';

/**
 * Fallback data for development/demo when API is not available
 */
const FALLBACK_DATA = {
  hotels: [
    { id: 1, name: 'Seaside Resort', location: 'Maldives', price: 850, rating: 4.8, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
    { id: 2, name: 'Mountain Lodge', location: 'Switzerland', price: 720, rating: 4.9, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
    { id: 3, name: 'Urban Hotel', location: 'New York', price: 650, rating: 4.7, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
    { id: 4, name: 'Beach Villa', location: 'Bali', price: 920, rating: 4.9, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' }
  ],
  flights: [
    { id: 1, destination: 'Paris', airline: 'Air France', price: 450, img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400' },
    { id: 2, destination: 'Tokyo', airline: 'JAL', price: 890, img: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400' },
    { id: 3, destination: 'Dubai', airline: 'Emirates', price: 720, img: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400' },
    { id: 4, destination: 'Sydney', airline: 'Qantas', price: 950, img: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=400' }
  ],
  cruises: [
    { id: 1, name: 'Caribbean Cruise', duration: '7 days', price: 1200, rating: 4.8, img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
    { id: 2, name: 'Mediterranean Cruise', duration: '10 days', price: 1550, rating: 4.9, img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400' },
    { id: 3, name: 'Alaska Cruise', duration: '8 days', price: 1350, rating: 4.7, img: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=400' },
    { id: 4, name: 'Nordic Cruise', duration: '12 days', price: 1800, rating: 4.9, img: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=400' }
  ],
  cars: [
    { id: 1, model: 'Luxury Sedan', type: 'Mercedes S-Class', price: 120, img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400' },
    { id: 2, model: 'SUV Premium', type: 'BMW X5', price: 95, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400' },
    { id: 3, model: 'Sports Car', type: 'Porsche 911', price: 250, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400' },
    { id: 4, model: 'Electric SUV', type: 'Tesla Model X', price: 150, img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400' }
  ],
  articles: [
    { id: 1, title: 'Travel to Simply Amazing', category: 'Travel Guide', date: 'Feb 8, 2024', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
    { id: 2, title: 'Hidden Gems to Explore', category: 'Destination', date: 'Feb 10, 2024', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400' },
    { id: 3, title: 'Best Travel Tips 2024', category: 'Travel Guide', date: 'Feb 12, 2024', img: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400' },
    { id: 4, title: 'Mountain Adventures Await', category: 'Adventure', date: 'Feb 15, 2024', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }
  ],
  team: [
    { id: 1, name: 'Emma Wilson', role: 'Tour Guide', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
    { id: 2, name: 'James Anderson', role: 'Travel Expert', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
    { id: 3, name: 'Michael Chen', role: 'Adventure Specialist', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' },
    { id: 4, name: 'Sarah Johnson', role: 'Customer Support', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300' }
  ]
};

/**
 * Custom hook for fetching travel data with fallback
 *
 * @param {string} dataType - Type of data to fetch (hotels, flights, etc.)
 * @returns {Object} { data, loading, error, refetch }
 */
const useTravelData = (dataType) => {
  const [finalData, setFinalData] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const endpoint = API_ENDPOINTS[dataType.toUpperCase()];
  const { data, loading, error, refetch } = useApi(endpoint, {
    immediate: true,
    cacheKey: dataType,
  });

  useEffect(() => {
    // If API fails or returns empty, use fallback data
    if (error || (!loading && !data)) {
      setUseFallback(true);
      setFinalData(FALLBACK_DATA[dataType] || []);
    } else if (data) {
      setUseFallback(false);
      setFinalData(Array.isArray(data) ? data : data.data || data.results || []);
    }
  }, [data, loading, error, dataType]);

  return {
    data: finalData,
    loading: loading && !useFallback,
    error: useFallback ? null : error,
    refetch,
    isUsingFallback: useFallback,
  };
};

export default useTravelData;
