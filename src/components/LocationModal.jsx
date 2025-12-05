import { useState } from 'react';
import { MapPin, Navigation, Search, X, Loader } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import './LocationModal.css';

// Popular cities for quick selection
const popularCities = [
  { city: 'New York', country: 'United States', countryCode: 'US', displayName: 'New York, United States' },
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', displayName: 'London, United Kingdom' },
  { city: 'Paris', country: 'France', countryCode: 'FR', displayName: 'Paris, France' },
  { city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', displayName: 'Dubai, UAE' },
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', displayName: 'Tokyo, Japan' },
  { city: 'Singapore', country: 'Singapore', countryCode: 'SG', displayName: 'Singapore' },
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', displayName: 'Sydney, Australia' },
  { city: 'Mumbai', country: 'India', countryCode: 'IN', displayName: 'Mumbai, India' },
];

const LocationModal = () => {
  const { showLocationModal, setShowLocationModal, setUserLocation, detectLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  if (!showLocationModal) return null;

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError('');
    try {
      const location = await detectLocation();
      setUserLocation(location);
    } catch (err) {
      setError('Could not detect your location. Please select manually.');
      console.error('Location detection error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectCity = (city) => {
    setUserLocation(city);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Create a custom location from search
      setUserLocation({
        city: searchQuery.trim(),
        country: '',
        countryCode: '',
        displayName: searchQuery.trim(),
        detectedAutomatically: false
      });
    }
  };

  const handleSkip = () => {
    // Set a default location
    setUserLocation({
      city: 'New York',
      country: 'United States',
      countryCode: 'US',
      displayName: 'New York, United States',
      detectedAutomatically: false
    });
  };

  const filteredCities = searchQuery
    ? popularCities.filter(city =>
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularCities;

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        <button className="location-modal-close" onClick={handleSkip} aria-label="Close">
          <X size={24} />
        </button>

        <div className="location-modal-header">
          <div className="location-modal-icon">
            <MapPin size={32} />
          </div>
          <h2 className="location-modal-title">Where are you located?</h2>
          <p className="location-modal-subtitle">
            We'll show you the best deals and options near you
          </p>
        </div>

        {error && (
          <div className="location-modal-error">
            {error}
          </div>
        )}

        <button
          className="location-detect-btn"
          onClick={handleDetectLocation}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <>
              <Loader size={20} className="spinning" />
              Detecting your location...
            </>
          ) : (
            <>
              <Navigation size={20} />
              Detect my location automatically
            </>
          )}
        </button>

        <div className="location-divider">
          <span>or select your city</span>
        </div>

        <form onSubmit={handleSearch} className="location-search-form">
          <div className="location-search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="location-search-input"
            />
          </div>
        </form>

        <div className="location-cities-grid">
          {filteredCities.map((city, index) => (
            <button
              key={index}
              className="location-city-btn"
              onClick={() => handleSelectCity(city)}
            >
              <MapPin size={16} />
              <span>{city.displayName}</span>
            </button>
          ))}
        </div>

        {searchQuery && filteredCities.length === 0 && (
          <button
            className="location-custom-btn"
            onClick={handleSearch}
          >
            <MapPin size={16} />
            Use "{searchQuery}" as my location
          </button>
        )}

        <button className="location-skip-btn" onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
