import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Briefcase, Heart, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import ToastContainer, { showToast } from '../components/ToastContainer';
import { useLocation } from '../context/LocationContext';
import ratehawkService from '../services/ratehawk.service';
import './Flights.css';

const Flights = () => {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Get user location from context
  const { userLocation } = useLocation();

  // Extract search parameters
  const urlFrom = searchParams.get('from') || '';
  const urlFromId = searchParams.get('from_id') || '';
  const urlTo = searchParams.get('to') || '';
  const urlToId = searchParams.get('to_id') || '';
  const departureDate = searchParams.get('departure');
  const returnDate = searchParams.get('return');
  const flightType = searchParams.get('flightType') || 'roundtrip';
  const adults = searchParams.get('adults') || 1;
  const children = searchParams.get('children') || 0;
  const flightClass = searchParams.get('class') || 'economy';

  // Use URL params or user's location as origin
  const from = urlFrom || (userLocation?.city ? `${userLocation.city} (${userLocation.countryCode || ''})` : '');
  const fromId = urlFromId;
  const to = urlTo;
  const toId = urlToId;

  // Check if search params exist (to_id is required for API search)
  const hasSearchParams = !!(fromId && toId);
  const hasUrlSearchParams = !!(urlFrom && urlTo);

  // Fetch flights from RateHawk API
  useEffect(() => {
    const fetchFlights = async () => {
      if (!hasSearchParams) {
        setLoading(false);
        setFlights([]);
        return;
      }

      setLoading(true);
      try {
        const results = await ratehawkService.searchFlights({
          from: from,
          from_id: fromId,
          to: to,
          to_id: toId,
          departure: departureDate,
          return: returnDate,
          adults: parseInt(adults),
          children: parseInt(children),
          infants: 0,
          class: flightClass
        });

        if (results && results.length > 0) {
          // Transform API results to match our UI format
          const transformedFlights = results.map((flight, index) => ({
            id: flight.id || index + 1,
            airline: flight.airline || flight.carrier_name || 'Airline',
            from: flight.departure_city || from,
            to: flight.arrival_city || to,
            departureTime: flight.departure_time || '08:00 AM',
            arrivalTime: flight.arrival_time || '11:30 AM',
            duration: flight.duration || '3h 30m',
            stops: flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`,
            price: flight.price || flight.amount || 299,
            class: flightClass,
            logo: flight.airline_logo || `https://via.placeholder.com/60x60?text=${(flight.airline || 'FL').substring(0, 2).toUpperCase()}`
          }));
          setFlights(transformedFlights);
          showToast(`Found ${transformedFlights.length} flights via RateHawk!`, 'success');
        } else {
          // No results from API - show message
          setFlights([]);
          showToast('No flights found for this route. Try different dates or destinations.', 'info');
        }
      } catch (error) {
        console.error('Flight search error:', error);
        setFlights([]);
        showToast('Flight search is currently unavailable. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, departureDate, returnDate, adults, children, flightClass, hasSearchParams]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleFavorite = (flightId) => {
    setFavorites((prev) =>
      prev.includes(flightId)
        ? prev.filter((id) => id !== flightId)
        : [...prev, flightId]
    );
  };

  const handleShare = (flight) => {
    if (navigator.share) {
      navigator
        .share({
          title: `${flight.airline} Flight`,
          text: `Check out this flight from ${flight.from} to ${flight.to}`,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  return (
    <>
      <SEO
        title={`Flights from ${from} to ${to} | Zanafly - Best Flight Deals`}
        description={`Find and book cheap flights from ${from} to ${to}. Compare prices and get the best deals.`}
        keywords="cheap flights, flight booking, airline tickets, flight deals"
        canonical="/flights"
      />

      <ToastContainer />

      <div className="flights-page">
        <Header />

        {/* Search Section */}
        <div className="flights-search-section">
          <EnhancedSearch initialTab="flight" showTabs={false} />
        </div>

        {/* Results Section */}
        <div className="flights-results-container">
          <div className="container">
            {/* Results Header */}
            <div className="flights-results-header">
              <div>
                <p className="flights-breadcrumb">
                  Home › Flights{hasSearchParams ? ` › ${from} to ${to}` : ''}
                </p>
                <h1 className="flights-title">
                  {!hasSearchParams ? 'Search for Flights' :
                   loading ? 'Searching flights...' : `${flights.length} Flights Found`}
                </h1>
                {hasSearchParams ? (
                  <p className="flights-search-info">
                    {from} <ArrowRight size={16} /> {to}
                    {departureDate && ` • ${formatDate(departureDate)}`}
                    {returnDate && flightType === 'roundtrip' && ` - ${formatDate(returnDate)}`}
                    {' '}• {adults} {adults === '1' ? 'Passenger' : 'Passengers'}
                    {' '}• {flightClass.charAt(0).toUpperCase() + flightClass.slice(1)}
                  </p>
                ) : (
                  <p className="flights-search-info">
                    Use the search above to find flights
                  </p>
                )}
              </div>

              {/* Sort */}
              <div className="flights-sort">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" className="flights-sort-select">
                  <option>Cheapest</option>
                  <option>Fastest</option>
                  <option>Best Value</option>
                  <option>Departure Time</option>
                  <option>Arrival Time</option>
                </select>
              </div>
            </div>

            {/* Flights List */}
            <div className="flights-list">
              {loading ? (
                // Skeleton loaders
                [...Array(6)].map((_, i) => (
                  <div key={i} className="flight-card skeleton">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                ))
              ) : (
                // Flight cards
                flights.map((flight) => (
                  <div key={flight.id} className="flight-card">
                    <div className="flight-card-header">
                      <div className="airline-info">
                        <img src={flight.logo} alt={flight.airline} className="airline-logo" />
                        <div>
                          <h3 className="airline-name">{flight.airline}</h3>
                          <p className="flight-class">
                            <Briefcase size={14} />
                            {flight.class.charAt(0).toUpperCase() + flight.class.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="flight-header-actions">
                        <div className="card-action-buttons">
                          <button
                            className={`card-action-button favorite-button ${
                              favorites.includes(flight.id) ? 'active' : ''
                            }`}
                            onClick={() => toggleFavorite(flight.id)}
                            aria-label="Add to favorites"
                          >
                            <Heart
                              size={20}
                              fill={favorites.includes(flight.id) ? 'currentColor' : 'none'}
                            />
                          </button>
                          <button
                            className="card-action-button share-button"
                            onClick={() => handleShare(flight)}
                            aria-label="Share"
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                        <div className="flight-price-header">
                          <span className="price-amount">${flight.price}</span>
                          <span className="price-period">per person</span>
                        </div>
                      </div>
                    </div>

                    <div className="flight-card-body">
                      <div className="flight-time-info">
                        <div className="flight-time">
                          <span className="time-large">{flight.departureTime}</span>
                          <span className="location">{flight.from}</span>
                        </div>

                        <div className="flight-duration">
                          <Clock size={16} />
                          <span>{flight.duration}</span>
                          <div className="flight-line">
                            <div className="flight-dot"></div>
                            <div className="flight-path"></div>
                            <Plane size={16} className="flight-icon" />
                          </div>
                          <span className="flight-stops">{flight.stops}</span>
                        </div>

                        <div className="flight-time">
                          <span className="time-large">{flight.arrivalTime}</span>
                          <span className="location">{flight.to}</span>
                        </div>
                      </div>

                      <Link
                        to={`/flight/${flight.id}?airline=${encodeURIComponent(flight.airline)}&from=${encodeURIComponent(flight.from)}&to=${encodeURIComponent(flight.to)}&departureTime=${encodeURIComponent(flight.departureTime)}&arrivalTime=${encodeURIComponent(flight.arrivalTime)}&duration=${encodeURIComponent(flight.duration)}&stops=${encodeURIComponent(flight.stops)}&price=${flight.price}&class=${encodeURIComponent(flight.class)}`}
                        className="flight-card-button"
                      >View Details</Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && flights.length === 0 && hasSearchParams && (
              <div className="no-results">
                <h3>No flights found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}

            {/* No Search Yet */}
            {!loading && !hasSearchParams && (
              <div className="no-results">
                <h3>Enter your travel details</h3>
                <p>Use the search form above to find available flights</p>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Flights;
