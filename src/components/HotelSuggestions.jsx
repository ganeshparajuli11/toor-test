import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Star, ChevronRight, Loader2, TrendingUp } from 'lucide-react';
import ratehawkService from '../services/ratehawk.service';
import './HotelSuggestions.css';

// Popular search terms for initial suggestions
const POPULAR_SEARCHES = [
  'Dubai',
  'Paris',
  'London',
  'New York',
  'Tokyo',
  'Barcelona',
  'Rome',
  'Amsterdam'
];

/**
 * HotelSuggestions Component
 *
 * Displays hotel suggestions based on user search input
 * Uses RateHawk autocomplete API to fetch real hotels
 */
const HotelSuggestions = ({ onHotelSelect, className = '' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ regions: [], hotels: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch initial popular suggestions on mount
  useEffect(() => {
    fetchPopularSuggestions();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPopularSuggestions = async () => {
    try {
      setLoading(true);
      // Fetch suggestions for a popular destination
      const results = await ratehawkService.searchRegions('Dubai');
      if (results && results.length > 0) {
        const regions = results.filter(r => r.type !== 'Hotel').slice(0, 4);
        const hotels = results.filter(r => r.type === 'Hotel').slice(0, 4);
        setSuggestions({ regions, hotels });
      }
    } catch (error) {
      console.error('Failed to fetch popular suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.length < 2) {
      fetchPopularSuggestions();
      return;
    }

    // Debounce API call
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await ratehawkService.searchRegions(query);

        if (results && results.length > 0) {
          const regions = results.filter(r => r.type !== 'Hotel').slice(0, 5);
          const hotels = results.filter(r => r.type === 'Hotel').slice(0, 5);
          setSuggestions({ regions, hotels });
        } else {
          setSuggestions({ regions: [], hotels: [] });
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions({ regions: [], hotels: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelectRegion = (region) => {
    // Navigate to hotels page with region ID
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    const params = new URLSearchParams({
      location: region.label || region.name,
      dest_id: region.id,
      search_type: region.type || 'City',
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: '2',
      children: '0',
      rooms: '1'
    });

    navigate(`/hotels?${params.toString()}`);
    setShowDropdown(false);
  };

  const handleSelectHotel = (hotel) => {
    // Navigate to property detail page
    navigate(`/property/${hotel.hotel_id || hotel.id}`);
    setShowDropdown(false);

    if (onHotelSelect) {
      onHotelSelect(hotel);
    }
  };

  const handleKeyDown = (e) => {
    const allItems = [...suggestions.regions, ...suggestions.hotels];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const item = allItems[selectedIndex];
      if (item.type === 'Hotel') {
        handleSelectHotel(item);
      } else {
        handleSelectRegion(item);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleQuickSearch = (term) => {
    setSearchQuery(term);
    handleSearch(term);
    setShowDropdown(true);
  };

  const totalSuggestions = suggestions.regions.length + suggestions.hotels.length;

  return (
    <div className={`hotel-suggestions ${className}`} ref={searchRef}>
      <div className="hotel-suggestions-header">
        <h2 className="hotel-suggestions-title">
          <Building2 size={24} />
          Find Your Perfect Stay
        </h2>
        <p className="hotel-suggestions-subtitle">
          Search for hotels, cities, or destinations
        </p>
      </div>

      {/* Search Input */}
      <div className="hotel-suggestions-search">
        <div className="hotel-search-input-wrapper">
          <Search size={20} className="hotel-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search hotels, cities, or regions..."
            className="hotel-search-input"
          />
          {loading && (
            <Loader2 size={18} className="hotel-search-loader" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div className="hotel-suggestions-dropdown">
            {loading && totalSuggestions === 0 ? (
              <div className="hotel-suggestions-loading">
                <Loader2 size={20} className="spin" />
                <span>Searching...</span>
              </div>
            ) : totalSuggestions > 0 ? (
              <>
                {/* Regions/Cities */}
                {suggestions.regions.length > 0 && (
                  <div className="hotel-suggestions-group">
                    <div className="hotel-suggestions-group-header">
                      <MapPin size={16} />
                      <span>Destinations</span>
                    </div>
                    {suggestions.regions.map((region, index) => (
                      <div
                        key={`region-${region.id}`}
                        className={`hotel-suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSelectRegion(region)}
                      >
                        <div className="hotel-suggestion-icon region">
                          <MapPin size={16} />
                        </div>
                        <div className="hotel-suggestion-content">
                          <span className="hotel-suggestion-name">{region.label || region.name}</span>
                          <span className="hotel-suggestion-type">{region.type}</span>
                        </div>
                        <ChevronRight size={16} className="hotel-suggestion-arrow" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Hotels */}
                {suggestions.hotels.length > 0 && (
                  <div className="hotel-suggestions-group">
                    <div className="hotel-suggestions-group-header">
                      <Building2 size={16} />
                      <span>Hotels</span>
                    </div>
                    {suggestions.hotels.map((hotel, index) => (
                      <div
                        key={`hotel-${hotel.id || hotel.hotel_id}`}
                        className={`hotel-suggestion-item ${selectedIndex === suggestions.regions.length + index ? 'selected' : ''}`}
                        onClick={() => handleSelectHotel(hotel)}
                      >
                        <div className="hotel-suggestion-icon hotel">
                          <Building2 size={16} />
                        </div>
                        <div className="hotel-suggestion-content">
                          <span className="hotel-suggestion-name">{hotel.label || hotel.name}</span>
                          <span className="hotel-suggestion-type">Hotel</span>
                        </div>
                        <ChevronRight size={16} className="hotel-suggestion-arrow" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : searchQuery.length >= 2 ? (
              <div className="hotel-suggestions-empty">
                <p>No results found for "{searchQuery}"</p>
                <p className="hotel-suggestions-empty-hint">Try a different search term</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Quick Search Tags */}
      <div className="hotel-suggestions-quick">
        <div className="quick-search-label">
          <TrendingUp size={16} />
          <span>Popular Destinations</span>
        </div>
        <div className="quick-search-tags">
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              className="quick-search-tag"
              onClick={() => handleQuickSearch(term)}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelSuggestions;
