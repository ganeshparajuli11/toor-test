import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Search, MapPin, Calendar, Users, Minus, Plus, X, Plane, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ratehawkService from '../services/ratehawk.service';
import 'react-datepicker/dist/react-datepicker.css';
import './EnhancedSearch.css';

const EnhancedSearch = ({ initialTab = 'hotel', showTabs = true }) => {
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
  const [toLocation, setToLocation] = useState('');
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
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState(null);
  const [dropoffDate, setDropoffDate] = useState(null);
  const [driverAge, setDriverAge] = useState('30');

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);

  const locationRef = useRef(null);
  const guestRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
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

    // Update the text value
    switch (field) {
      case 'hotel':
        setHotelLocation(value);
        setHotelLocationData(null); // Clear location data when typing
        break;
      case 'from':
        setFromLocation(value);
        break;
      case 'to':
        setToLocation(value);
        break;
      case 'cruise':
        setCruiseDestination(value);
        break;
      case 'pickup':
        setPickupLocation(value);
        break;
      case 'dropoff':
        setDropoffLocation(value);
        break;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If empty, hide dropdown
    if (!value || value.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    // Debounce API call
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoadingLocations(true);

        // Use RateHawk service for hotel autocomplete
        // For other tabs (flight, car), we might need different services, 
        // but for now we'll use RateHawk regions for all or just hotels

        if (field === 'hotel') {
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

            setLocationSuggestions(suggestions.slice(0, 5));
            setShowLocationDropdown(true);
          } else {
            setLocationSuggestions([]);
          }
        } else {
          // Fallback for other tabs if needed, or implement specific services
          // For now, just mock some data or keep empty
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error('Location search error:', error);
        setLocationSuggestions([]);
      } finally {
        setLoadingLocations(false);
      }
    }, 300); // 300ms debounce
  };

  const selectLocation = (location) => {
    // location is now the full API response object with dest_id, label, etc.
    switch (activeLocationField) {
      case 'hotel':
        setHotelLocation(location.label || location.name);
        setHotelLocationData(location); // Store full location object
        break;
      case 'from':
        setFromLocation(location.label || location.name);
        break;
      case 'to':
        setToLocation(location.label || location.name);
        break;
      case 'cruise':
        setCruiseDestination(location.label || location.name);
        break;
      case 'pickup':
        setPickupLocation(location.label || location.name);
        break;
      case 'dropoff':
        setDropoffLocation(location.label || location.name);
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
          to: toLocation,
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
        if (!pickupDate || !dropoffDate) {
          toast.error('Please select pickup and drop-off dates');
          return;
        }
        searchParams = {
          ...searchParams,
          pickup: pickupLocation,
          dropoff: dropoffLocation || pickupLocation,
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
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={hotelLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'hotel')}
                  placeholder="Type to search any city..."
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'hotel' && (
                  <div className="location-dropdown">
                    {loadingLocations ? (
                      <div className="location-suggestion" style={{ opacity: 0.7 }}>
                        <span>Searching...</span>
                      </div>
                    ) : locationSuggestions.length > 0 ? (
                      locationSuggestions.map((suggestion, index) => (
                        <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                          <MapPin size={14} />
                          <div style={{ flex: 1 }}>
                            <div>{suggestion.label}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {suggestion.search_type === 'Hotel' ? 'Hotel' : `${suggestion.hotels || 0} hotels • ${suggestion.search_type}`}
                            </div>
                          </div>
                        </div>
                      ))
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
                  <span>Check In</span>
                </label>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date) => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>Check Out</span>
                </label>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date) => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate || new Date()}
                  placeholderText="Select date"
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              <div className="enhanced-search-field" ref={guestRef}>
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>Guests & Rooms</span>
                </label>
                <input
                  type="text"
                  value={getGuestText('hotel')}
                  onFocus={() => setShowGuestSelector(true)}
                  readOnly
                  placeholder="Select guests"
                  className="enhanced-search-input cursor-pointer"
                />
                {showGuestSelector && (
                  <div className="guest-selector-dropdown">
                    <div className="guest-selector-header">
                      <span>Select Guests & Rooms</span>
                      <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">Adults</div>
                        <div className="guest-type-desc">Age 18+</div>
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
                        <div className="guest-type-label">Children</div>
                        <div className="guest-type-desc">Age 0-17</div>
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
                        <div className="guest-type-label">Rooms</div>
                        <div className="guest-type-desc">Number of rooms</div>
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
                      Done
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
                  <span>Trip Type</span>
                </label>
                <select value={flightType} onChange={(e) => setFlightType(e.target.value)} className="enhanced-search-input">
                  <option value="roundtrip">Round Trip</option>
                  <option value="oneway">One Way</option>
                </select>
              </div>

              <div className="enhanced-search-field" ref={locationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>From</span>
                </label>
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'from')}
                  placeholder="Departure city"
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'from' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>To</span>
                </label>
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'to')}
                  placeholder="Destination city"
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'to' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>Departure</span>
                </label>
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => setDepartureDate(date)}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              {flightType === 'roundtrip' && (
                <div className="enhanced-search-field">
                  <label className="enhanced-search-label">
                    <Calendar size={18} />
                    <span>Return</span>
                  </label>
                  <DatePicker
                    selected={returnDate}
                    onChange={(date) => setReturnDate(date)}
                    minDate={departureDate || new Date()}
                    placeholderText="Select date"
                    className="enhanced-search-input"
                    dateFormat="MMM dd, yyyy"
                  />
                </div>
              )}

              <div className="enhanced-search-field" ref={guestRef}>
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>Passengers</span>
                </label>
                <input
                  type="text"
                  value={getGuestText('flight')}
                  onFocus={() => setShowGuestSelector(true)}
                  readOnly
                  placeholder="Select passengers"
                  className="enhanced-search-input cursor-pointer"
                />
                {showGuestSelector && (
                  <div className="guest-selector-dropdown">
                    <div className="guest-selector-header">
                      <span>Select Passengers</span>
                      <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">Adults</div>
                        <div className="guest-type-desc">Age 18+</div>
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
                        <div className="guest-type-label">Children</div>
                        <div className="guest-type-desc">Age 2-17</div>
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
                        <div className="guest-type-label">Infants</div>
                        <div className="guest-type-desc">Under 2</div>
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
                      Done
                    </button>
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>Class</span>
                </label>
                <select value={flightClass} onChange={(e) => setFlightClass(e.target.value)} className="enhanced-search-input">
                  <option value="economy">Economy</option>
                  <option value="premium">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </>
          )}

          {/* CRUISE SEARCH FORM */}
          {activeTab === 'cruise' && (
            <>
              <div className="enhanced-search-field" ref={locationRef}>
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>Destination</span>
                </label>
                <input
                  type="text"
                  value={cruiseDestination}
                  onChange={(e) => handleLocationInput(e.target.value, 'cruise')}
                  placeholder="Where to?"
                  className="enhanced-search-input"
                />
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>Departure</span>
                </label>
                <DatePicker
                  selected={cruiseDepartureDate}
                  onChange={(date) => setCruiseDepartureDate(date)}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="enhanced-search-input"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Clock size={18} />
                  <span>Duration</span>
                </label>
                <select value={cruiseDuration} onChange={(e) => setCruiseDuration(e.target.value)} className="enhanced-search-input">
                  <option value="3">3 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days</option>
                  <option value="10">10 Days</option>
                  <option value="14">14 Days</option>
                </select>
              </div>

              <div className="enhanced-search-field" ref={guestRef}>
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>Passengers</span>
                </label>
                <input
                  type="text"
                  value={getGuestText('cruise')}
                  onFocus={() => setShowGuestSelector(true)}
                  readOnly
                  placeholder="Select passengers"
                  className="enhanced-search-input cursor-pointer"
                />
                {showGuestSelector && (
                  <div className="guest-selector-dropdown">
                    <div className="guest-selector-header">
                      <span>Select Passengers</span>
                      <button type="button" onClick={() => setShowGuestSelector(false)} className="guest-selector-close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="guest-selector-item">
                      <div>
                        <div className="guest-type-label">Adults</div>
                        <div className="guest-type-desc">Age 18+</div>
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
                        <div className="guest-type-label">Children</div>
                        <div className="guest-type-desc">Age 0-17</div>
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
                      Done
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
                  <span>Pick-up Location</span>
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'pickup')}
                  placeholder="City or Airport"
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'pickup' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <MapPin size={18} />
                  <span>Drop-off Location</span>
                </label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => handleLocationInput(e.target.value, 'dropoff')}
                  placeholder="Same as pick-up"
                  className="enhanced-search-input"
                />
                {showLocationDropdown && activeLocationField === 'dropoff' && locationSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="location-suggestion" onClick={() => selectLocation(suggestion)}>
                        <MapPin size={14} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Calendar size={18} />
                  <span>Pick-up Date</span>
                </label>
                <DatePicker
                  selected={pickupDate}
                  onChange={(date) => setPickupDate(date)}
                  minDate={new Date()}
                  placeholderText="Select date"
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
                  <span>Drop-off Date</span>
                </label>
                <DatePicker
                  selected={dropoffDate}
                  onChange={(date) => setDropoffDate(date)}
                  minDate={pickupDate || new Date()}
                  placeholderText="Select date"
                  className="enhanced-search-input"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMM dd, yyyy h:mm aa"
                />
              </div>

              <div className="enhanced-search-field">
                <label className="enhanced-search-label">
                  <Users size={18} />
                  <span>Driver Age</span>
                </label>
                <select value={driverAge} onChange={(e) => setDriverAge(e.target.value)} className="enhanced-search-input">
                  <option value="18-24">18-24 years</option>
                  <option value="25-29">25-29 years</option>
                  <option value="30">30+ years</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="enhanced-search-button">
            <Search size={20} />
            <span>Search</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnhancedSearch;
