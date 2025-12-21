import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Search, MapPin, Calendar, Users, Minus, Plus, X, Plane, Clock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ratehawkService from '../services/ratehawk.service';
import { useLanguage } from '../contexts/LanguageContext';
import 'react-datepicker/dist/react-datepicker.css';
import './EnhancedSearch.css';

// Popular destinations for quick selection - CORRECT RateHawk region IDs
const POPULAR_DESTINATIONS = [
  { dest_id: '2734', label: 'Paris, France', search_type: 'City', hotels: 5000 },
  { dest_id: '2114', label: 'London, United Kingdom', search_type: 'City', hotels: 8000 },
  { dest_id: '2621', label: 'New York, United States', search_type: 'City', hotels: 6000 },
  { dest_id: '3593', label: 'Tokyo, Japan', search_type: 'City', hotels: 4000 },
  { dest_id: '6053839', label: 'Dubai, UAE', search_type: 'City', hotels: 3500 },
  { dest_id: '513', label: 'Barcelona, Spain', search_type: 'City', hotels: 3000 },
  { dest_id: '3023', label: 'Rome, Italy', search_type: 'City', hotels: 4000 },
  { dest_id: '378', label: 'Amsterdam, Netherlands', search_type: 'City', hotels: 2500 },
];

const EnhancedSearch = ({ initialTab = 'hotel', showTabs = true }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Hotel search state
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelLocationData, setHotelLocationData] = useState(null); // Store full location object with dest_id
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [hotelGuests, setHotelGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  // Flight search state
  const [fromLocation, setFromLocation] = useState('');
  const [fromLocationData, setFromLocationData] = useState(null);
  const [toLocation, setToLocation] = useState('');
  const [toLocationData, setToLocationData] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [flightType, setFlightType] = useState('roundtrip');
  const [flightPassengers, setFlightPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [flightClass, setFlightClass] = useState('economy');

  // Cruise search state
  const [cruiseDestination, setCruiseDestination] = useState('');
  const [cruiseDepartureDate, setCruiseDepartureDate] = useState(null);
  const [cruiseDuration, setCruiseDuration] = useState('7');
  const [cruisePassengers, setCruisePassengers] = useState({ adults: 2, children: 0 });

  // Car search state
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupLocationData, setPickupLocationData] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffLocationData, setDropoffLocationData] = useState(null);
  const [pickupDate, setPickupDate] = useState(null);
  const [dropoffDate, setDropoffDate] = useState(null);
  const [driverAge, setDriverAge] = useState('30');

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);

  const locationRef = useRef(null);
  const toLocationRef = useRef(null);
  const dropoffLocationRef = useRef(null);
  const guestRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideLocationRef = locationRef.current && locationRef.current.contains(event.target);
      const isInsideToLocationRef = toLocationRef.current && toLocationRef.current.contains(event.target);
      const isInsideDropoffLocationRef = dropoffLocationRef.current && dropoffLocationRef.current.contains(event.target);

      if (!isInsideLocationRef && !isInsideToLocationRef && !isInsideDropoffLocationRef) {
        setShowLocationDropdown(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setShowGuestSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationInput = async (value, field) => {
    setActiveLocationField(field);

    // Update the text value and clear location data when typing
    switch (field) {
      case 'hotel':
        setHotelLocation(value);
        setHotelLocationData(null);
        break;
      case 'from':
        setFromLocation(value);
        setFromLocationData(null);
        break;
      case 'to':
        setToLocation(value);
        setToLocationData(null);
        break;
      case 'cruise':
        setCruiseDestination(value);
        break;
      case 'pickup':
        setPickupLocation(value);
        setPickupLocationData(null);
        break;
      case 'dropoff':
        setDropoffLocation(value);
        setDropoffLocationData(null);
        break;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If empty, show popular destinations
    if (!value || value.length < 2) {
      setLocationSuggestions(POPULAR_DESTINATIONS);
      setShowLocationDropdown(true);
      return;
    }

    // Debounce API call
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoadingLocations(true);

        // Use RateHawk service for autocomplete on all location fields
        const results = await ratehawkService.searchRegions(value);

        if (results && results.length > 0) {
          // Transform RateHawk regions/hotels to suggestion format
          const suggestions = results.map(item => ({
            dest_id: item.id,
            label: item.label || item.name,
            search_type: item.type,
            hotels: item.hotels_count || 0,
            hotel_id: item.hotel_id // For direct hotel selection if needed
          }));

          // Show more results (up to 10 - 5 destinations + 5 hotels)
          setLocationSuggestions(suggestions.slice(0, 10));
          setShowLocationDropdown(true);
        } else {
          // Show popular destinations as fallback
          setLocationSuggestions(POPULAR_DESTINATIONS);
          setShowLocationDropdown(true);
        }
      } catch (error) {
        console.error('Location search error:', error);
        // Show popular destinations on error
        setLocationSuggestions(POPULAR_DESTINATIONS);
        setShowLocationDropdown(true);
      } finally {
        setLoadingLocations(false);
      }
    }, 300); // 300ms debounce
  };

  // Show popular destinations when field is focused
  const handleLocationFocus = (field) => {
    setActiveLocationField(field);
    if (locationSuggestions.length === 0) {
      setLocationSuggestions(POPULAR_DESTINATIONS);
    }
    setShowLocationDropdown(true);
  };

  const selectLocation = (location) => {
    // location is now the full API response object with dest_id, label, etc.
    switch (activeLocationField) {
      case 'hotel':
        setHotelLocation(location.label || location.name);
        setHotelLocationData(location);
        break;
      case 'from':
        setFromLocation(location.label || location.name);
        setFromLocationData(location);
        break;
      case 'to':
        setToLocation(location.label || location.name);
        setToLocationData(location);
        break;
      case 'cruise':
        setCruiseDestination(location.label || location.name);
        break;
      case 'pickup':
        setPickupLocation(location.label || location.name);
        setPickupLocationData(location);
        break;
      case 'dropoff':
        setDropoffLocation(location.label || location.name);
        setDropoffLocationData(location);
        break;
    }
    setShowLocationDropdown(false);
  };

  const handleGuestChange = (type, operation, guestType = 'hotel') => {
    const setState = guestType === 'hotel' ? setHotelGuests :
      guestType === 'flight' ? setFlightPassengers :
        setCruisePassengers;

    setState(prev => ({
      ...prev,
      [type]: operation === 'increase'
        ? prev[type] + 1
        : Math.max(0, prev[type] - 1)
    }));
  };

  const getGuestText = (guestType) => {
    const guests = guestType === 'hotel' ? hotelGuests :
      guestType === 'flight' ? flightPassengers :
        cruisePassengers;

    const parts = [];
    if (guests.adults > 0) parts.push(`${guests.adults} Adult${guests.adults > 1 ? 's' : ''}`);
    if (guests.children > 0) parts.push(`${guests.children} Child${guests.children > 1 ? 'ren' : ''}`);
    if (guests.infants) parts.push(`${guests.infants} Infant${guests.infants > 1 ? 's' : ''}`);
    if (guests.rooms) parts.push(`${guests.rooms} Room${guests.rooms > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(', ') : 'Select guests';
  };

  const handleSearch = (e) => {
    e.preventDefault();

    let searchParams = { type: activeTab };
    let isValid = true;

    switch (activeTab) {
      case 'hotel':
        if (!hotelLocation) {
          toast.error('Please enter a destination');
          return;
        }
        if (!hotelLocationData?.dest_id) {
          toast.error('Please select a location from the dropdown suggestions');
          return;
        }
        if (!checkInDate || !checkOutDate) {
          toast.error('Please select check-in and check-out dates');
          return;
        }
        searchParams = {
          ...searchParams,
          location: hotelLocation,
          dest_id: hotelLocationData?.dest_id || '',
          search_type: hotelLocationData?.search_type || 'CITY',
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
          adults: hotelGuests.adults,
          children: hotelGuests.children,
          rooms: hotelGuests.rooms
        };
        break;

      case 'flight':
        if (!fromLocation || !toLocation) {
          toast.error('Please enter departure and destination');
          return;
        }
        if (!fromLocationData?.dest_id || !toLocationData?.dest_id) {
          toast.error('Please select locations from the dropdown suggestions');
          return;
        }
        if (!departureDate) {
          toast.error('Please select departure date');
          return;
        }
        if (flightType === 'roundtrip' && !returnDate) {
          toast.error('Please select return date');
          return;
        }
        searchParams = {
          ...searchParams,
          from: fromLocation,
          from_id: fromLocationData?.dest_id || '',
          to: toLocation,
          to_id: toLocationData?.dest_id || '',
          departure: departureDate.toISOString(),
          return: returnDate?.toISOString(),
          flightType,
          adults: flightPassengers.adults,
          children: flightPassengers.children,
          infants: flightPassengers.infants,
          class: flightClass
        };
        break;

      case 'cruise':
        if (!cruiseDestination) {
          toast.error('Please enter a destination');
          return;
        }
        if (!cruiseDepartureDate) {
          toast.error('Please select departure date');
          return;
        }
        searchParams = {
          ...searchParams,
          destination: cruiseDestination,
          departure: cruiseDepartureDate.toISOString(),
          duration: cruiseDuration,
          adults: cruisePassengers.adults,
          children: cruisePassengers.children
        };
        break;

      case 'car':
        if (!pickupLocation) {
          toast.error('Please enter pickup location');
          return;
        }
        if (!pickupLocationData?.dest_id) {
          toast.error('Please select a pickup location from the dropdown suggestions');
          return;
        }
        if (!pickupDate || !dropoffDate) {
          toast.error('Please select pickup and drop-off dates');
          return;
        }
        searchParams = {
          ...searchParams,
          pickup: pickupLocation,
          pickup_id: pickupLocationData?.dest_id || '',
          dropoff: dropoffLocation || pickupLocation,
          dropoff_id: dropoffLocationData?.dest_id || pickupLocationData?.dest_id || '',
          pickupDate: pickupDate.toISOString(),
          dropoffDate: dropoffDate.toISOString(),
          driverAge
        };
        break;
    }

    // Navigate to the appropriate listing page with search params
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/${activeTab}s?${queryString}`);
  };

  return (
    <div className="enhanced-search-container">
      <div className="enhanced-search-card">
        {showTabs && (
          <div className="enhanced-search-tabs">
            {['hotel', 'flight', 'cruise', 'car'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`enhanced-search-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSearch} className="enhanced-search-form">
          {/* HOTEL SEARCH FORM */}
          {activeTab === 'hotel' && (
            <>
              <div className="enhanced-search-field" ref={locationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>{t('Location')}</span>
                </label>
                <input
                  type="text"
                  value={hotelLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'hotel')}
                  onFocus={() => handleLocationFocus('hotel')}
                  placeholder={t('Where are you going?')}
                  className={`enhanced-search-input ${hotelLocation && !hotelLocationData ? 'input-warning' : ''}`}
                />
                {showLocationDropdown && activeLocationField === 'hotel' && (
                  <div className="location-dropdown">
                    {loadingLocations ? (
                      <div className="location-suggestion" style={{ opacity: 0.7 }}>
                        <span>Searching...</span>
                      </div>
                    ) : locationSuggestions.length > 0 ? (
                      <>
                        {/* Destinations Section */}
                        {locationSuggestions.filter(s => s.search_type !== 'Hotel').length > 0 && (
                          <div className="location-group">
                            <div className="location-group-header">
                              <MapPin size={14} />
                              <span>Destinations</span>
                            </div>
                            {locationSuggestions
                              .filter(s => s.search_type !== 'Hotel')
                              .slice(0, 5)
                              .map((suggestion, index) => (
                                <div key={`dest-${index}`} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                                  <div className="location-icon destination">
                                    <MapPin size={14} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div className="location-name">{suggestion.label}</div>
                                    <div className="location-meta">
                                      {suggestion.hotels || 0} hotels • {suggestion.search_type}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Hotels Section */}
                        {locationSuggestions.filter(s => s.search_type === 'Hotel').length > 0 && (
                          <div className="location-group">
                            <div className="location-group-header">
                              <Building2 size={14} />
                              <span>Hotels</span>
                            </div>
                            {locationSuggestions
                              .filter(s => s.search_type === 'Hotel')
                              .slice(0, 5)
                              .map((suggestion, index) => (
                                <div key={`hotel-${index}`} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                                  <div className="location-icon hotel">
                                    <Building2 size={14} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div className="location-name">{suggestion.label}</div>
                                    <div className="location-meta">Hotel</div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="location-suggestion" style={{ opacity: 0.7 }}>
                        <span>No locations found</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>{t('Check In')}</span>
                </label>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date) => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  placeholderText={t('Select date')}
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>{t('Check Out')}</span>
                </label>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date) => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate || new Date()}
                  placeholderText={t('Select date')}
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              <div className="enhanced-search-field" ref={guestRef}>
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>{t('Guests')} & {t('Rooms')}</span>
                </label>
                <input
                  type="text"
                  value={getGuestText('hotel')}
                  onFocus={() => setShowGuestSelector(true)}
                  readOnly
                  placeholder={t('Guests')}
                  className="enhanced-search-input cursor-pointer"
                />
                {showGuestSelector && (
                  <div className="guest-selector-dropdown">
                    <div className="guest-selector-header">
                      <span>{t('Guests')} & {t('Rooms')}</span>
                      <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Adults')}</div>
                        <div className="guest-type-desc">18+</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('adults', 'decrease', 'hotel')}
                          disabled={hotelGuests.adults <= 1} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{hotelGuests.adults}</span>
                        <button type="button" onClick={() => handleGuestChange('adults', 'increase', 'hotel')}
                          disabled={hotelGuests.adults >= 10} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Children')}</div>
                        <div className="guest-type-desc">0-17</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('children', 'decrease', 'hotel')}
                          disabled={hotelGuests.children <= 0} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{hotelGuests.children}</span>
                        <button type="button" onClick={() => handleGuestChange('children', 'increase', 'hotel')}
                          disabled={hotelGuests.children >= 10} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Rooms')}</div>
                        <div className="guest-type-desc">#</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('rooms', 'decrease', 'hotel')}
                          disabled={hotelGuests.rooms <= 1} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{hotelGuests.rooms}</span>
                        <button type="button" onClick={() => handleGuestChange('rooms', 'increase', 'hotel')}
                          disabled={hotelGuests.rooms >= 10} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-done">
                      {t('Apply')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* FLIGHT SEARCH FORM */}
          {activeTab === 'flight' && (
            <>
              <div className="enhanced-search-field flight-type-selector">
                <label className="enhanced-search-label">
                  <Plane size={18} />
                  <span>{t('Round Trip')}</span>
                </label>
                <select value={flightType} onChange={(e) => setFlightType(e.target.value)} className="enhanced-search-input">
                  <option value="roundtrip">{t('Round Trip')}</option>
                  <option value="oneway">{t('One Way')}</option>
                </select>
              </div>

              <div className="enhanced-search-field" ref={locationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>{t('From')}</span>
                </label>
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'from')}
                  onFocus={() => handleLocationFocus('from')}
                  placeholder={t('From')}
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'from' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field" ref={toLocationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>{t('To')}</span>
                </label>
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'to')}
                  onFocus={() => handleLocationFocus('to')}
                  placeholder={t('To')}
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'to' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>{t('Departure')}</span>
                </label>
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => setDepartureDate(date)}
                  minDate={new Date()}
                  placeholderText={t('Select date')}
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              {flightType === 'roundtrip' && (
                <div className="enhanced-search-field">
                  <label className="enhanced-search-label">
                    <Calendar size={18} />
                    <span>{t('Return')}</span>
                  </label>
                  <DatePicker
                    selected={returnDate}
                    onChange={(date) => setReturnDate(date)}
                    minDate={departureDate || new Date()}
                    placeholderText={t('Select date')}
                    className="enhanced-search-input"
                    dateFormat="MMM dd, yyyy"
                  />
                </div>
              )}

              <div className="enhanced-search-field" ref={guestRef}>
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>{t('Guests')}</span>
                </label>
                <input
                  type="text"
                  value={getGuestText('flight')}
                  onFocus={() => setShowGuestSelector(true)}
                  readOnly
                  placeholder={t('Guests')}
                  className="enhanced-search-input cursor-pointer"
                />
                {showGuestSelector && (
                  <div className="guest-selector-dropdown">
                    <div className="guest-selector-header">
                      <span>{t('Guests')}</span>
                      <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Adults')}</div>
                        <div className="guest-type-desc">18+</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('adults', 'decrease', 'flight')}
                          disabled={flightPassengers.adults <= 1} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{flightPassengers.adults}</span>
                        <button type="button" onClick={() => handleGuestChange('adults', 'increase', 'flight')}
                          disabled={flightPassengers.adults >= 9} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Children')}</div>
                        <div className="guest-type-desc">2-17</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('children', 'decrease', 'flight')}
                          disabled={flightPassengers.children <= 0} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{flightPassengers.children}</span>
                        <button type="button" onClick={() => handleGuestChange('children', 'increase', 'flight')}
                          disabled={flightPassengers.children >= 9} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Infants')}</div>
                        <div className="guest-type-desc">0-2</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('infants', 'decrease', 'flight')}
                          disabled={flightPassengers.infants <= 0} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{flightPassengers.infants}</span>
                        <button type="button" onClick={() => handleGuestChange('infants', 'increase', 'flight')}
                          disabled={flightPassengers.infants >= 4} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-done">
                      {t('Apply')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CRUISE SEARCH FORM */}
          {activeTab === 'cruise' && (
            <>
              <div className="enhanced-search-field" ref={locationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>{t('Location')}</span>
                </label>
                <input
                  type="text"
                  value={cruiseDestination}
                  onChange={(e) => handleLocationInput(e.target.value, 'cruise')}
                  onFocus={() => handleLocationFocus('cruise')}
                  placeholder={t('Where are you going?')}
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'cruise' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>{t('Departure')}</span>
                </label>
                <DatePicker
                  selected={cruiseDepartureDate}
                  onChange={(date) => setCruiseDepartureDate(date)}
                  minDate={new Date()}
                  placeholderText={t('Select date')}
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Clock size={18} />
                  <span>{t('Days')}</span>
                </label>
                <select value={cruiseDuration} onChange={(e) => setCruiseDuration(e.target.value)} className="enhanced-search-input">
                  <option value="3">3 {t('Days')}</option>
                  <option value="5">5 {t('Days')}</option>
                  <option value="7">7 {t('Days')}</option>
                  <option value="10">10 {t('Days')}</option>
                  <option value="14">14 {t('Days')}</option>
                </select>
              </div>

              <div className="enhanced-search-field" ref={guestRef}>
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>{t('Guests')}</span>
                </label>
                <input
                  type="text"
                  value={getGuestText('cruise')}
                  onFocus={() => setShowGuestSelector(true)}
                  readOnly
                  placeholder={t('Guests')}
                  className="enhanced-search-input cursor-pointer"
                />
                {showGuestSelector && (
                  <div className="guest-selector-dropdown">
                    <div className="guest-selector-header">
                      <span>{t('Guests')}</span>
                      <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Adults')}</div>
                        <div className="guest-type-desc">18+</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('adults', 'decrease', 'cruise')}
                          disabled={cruisePassengers.adults <= 1} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{cruisePassengers.adults}</span>
                        <button type="button" onClick={() => handleGuestChange('adults', 'increase', 'cruise')}
                          disabled={cruisePassengers.adults >= 10} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">{t('Children')}</div>
                        <div className="guest-type-desc">0-17</div>
                      </div>
                      <div className="guest-counter">
                        <button type="button" onClick={() => handleGuestChange('children', 'decrease', 'cruise')}
                          disabled={cruisePassengers.children <= 0} className="guest-counter-btn">
                          <Minus size={14} />
                        </button>
                        <span className="guest-count">{cruisePassengers.children}</span>
                        <button type="button" onClick={() => handleGuestChange('children', 'increase', 'cruise')}
                          disabled={cruisePassengers.children >= 10} className="guest-counter-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-done">
                      {t('Apply')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CAR SEARCH FORM */}
          {activeTab === 'car' && (
            <>
              <div className="enhanced-search-field" ref={locationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>{t('Pick-up Location')}</span>
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'pickup')}
                  onFocus={() => handleLocationFocus('pickup')}
                  placeholder={t('Location')}
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'pickup' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field" ref={dropoffLocationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>{t('Drop-off Location')}</span>
                </label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'dropoff')}
                  onFocus={() => handleLocationFocus('dropoff')}
                  placeholder={t('Location')}
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'dropoff' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>{t('Pick-up Date')}</span>
                </label>
                <DatePicker
                  selected={pickupDate}
                  onChange={(date) => setPickupDate(date)}
                  minDate={new Date()}
                  placeholderText={t('Select date')}
                  className="enhanced-search-input"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMM dd, yyyy h:mm aa"
                />
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>{t('Drop-off Date')}</span>
                </label>
                <DatePicker
                  selected={dropoffDate}
                  onChange={(date) => setDropoffDate(date)}
                  minDate={pickupDate || new Date()}
                  placeholderText={t('Select date')}
                  className="enhanced-search-input"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMM dd, yyyy h:mm aa"
                />
              </div>
            </>
          )}

          <button type="submit" className="enhanced-search-button">
            <Search size={20} />
            <span>{t('Search')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnhancedSearch;
