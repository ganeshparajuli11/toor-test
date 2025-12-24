import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Helper function to check if current path is admin
const isAdminPage = () => {
  return window.location.pathname.startsWith('/admin');
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    // Don't show location modal on admin pages
    if (isAdminPage()) {
      setIsLoading(false);
      return;
    }

    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Error parsing saved location:', e);
        setShowLocationModal(true);
      }
    } else {
      // No saved location, show modal after a short delay
      setTimeout(() => {
        // Double check we're not on admin page before showing
        if (!isAdminPage()) {
          setShowLocationModal(true);
        }
      }, 1000);
    }
    setIsLoading(false);
  }, []);

  // Save location to localStorage whenever it changes
  const saveLocation = (location) => {
    setUserLocation(location);
    localStorage.setItem('userLocation', JSON.stringify(location));
    setShowLocationModal(false);
  };

  // Clear location
  const clearLocation = () => {
    setUserLocation(null);
    localStorage.removeItem('userLocation');
    setShowLocationModal(true);
  };

  // Detect location using browser geolocation
  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding to get city name
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown';
            const country = data.address?.country || '';
            const countryCode = data.address?.country_code?.toUpperCase() || '';

            const location = {
              city,
              country,
              countryCode,
              latitude,
              longitude,
              displayName: `${city}, ${country}`,
              detectedAutomatically: true
            };

            resolve(location);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        { timeout: 10000 }
      );
    });
  };

  const value = {
    userLocation,
    setUserLocation: saveLocation,
    showLocationModal,
    setShowLocationModal,
    clearLocation,
    detectLocation,
    isLoading
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
