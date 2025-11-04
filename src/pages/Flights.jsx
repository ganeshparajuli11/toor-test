import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Briefcase } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import './Flights.css';

const Flights = () => {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract search parameters
  const from = searchParams.get('from') || 'Origin';
  const to = searchParams.get('to') || 'Destination';
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const flightType = searchParams.get('flightType') || 'roundtrip';
  const adults = searchParams.get('adults') || 1;
  const children = searchParams.get('children') || 0;
  const flightClass = searchParams.get('flightClass') || 'economy';

  // Demo flight data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFlights([
        {
          id: 1,
          airline: 'Sky Airways',
          from: from,
          to: to,
          departureTime: '08:00 AM',
          arrivalTime: '11:30 AM',
          duration: '3h 30m',
          stops: 'Non-stop',
          price: 299,
          class: flightClass,
          logo: 'https://via.placeholder.com/60x60?text=SA'
        },
        {
          id: 2,
          airline: 'Global Airlines',
          from: from,
          to: to,
          departureTime: '12:00 PM',
          arrivalTime: '04:15 PM',
          duration: '4h 15m',
          stops: '1 Stop',
          price: 249,
          class: flightClass,
          logo: 'https://via.placeholder.com/60x60?text=GA'
        },
        {
          id: 3,
          airline: 'Ocean Air',
          from: from,
          to: to,
          departureTime: '03:30 PM',
          arrivalTime: '07:00 PM',
          duration: '3h 30m',
          stops: 'Non-stop',
          price: 329,
          class: flightClass,
          logo: 'https://via.placeholder.com/60x60?text=OA'
        },
        {
          id: 4,
          airline: 'Express Jets',
          from: from,
          to: to,
          departureTime: '06:00 PM',
          arrivalTime: '10:45 PM',
          duration: '4h 45m',
          stops: '1 Stop',
          price: 199,
          class: flightClass,
          logo: 'https://via.placeholder.com/60x60?text=EJ'
        },
        {
          id: 5,
          airline: 'Premium Airways',
          from: from,
          to: to,
          departureTime: '09:00 AM',
          arrivalTime: '12:15 PM',
          duration: '3h 15m',
          stops: 'Non-stop',
          price: 399,
          class: flightClass,
          logo: 'https://via.placeholder.com/60x60?text=PA'
        },
        {
          id: 6,
          airline: 'Budget Air',
          from: from,
          to: to,
          departureTime: '01:00 PM',
          arrivalTime: '06:30 PM',
          duration: '5h 30m',
          stops: '2 Stops',
          price: 149,
          class: flightClass,
          logo: 'https://via.placeholder.com/60x60?text=BA'
        }
      ]);
      setLoading(false);
    }, 800);
  }, [from, to, flightClass]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <SEO
        title={`Flights from ${from} to ${to} | TOOR - Best Flight Deals`}
        description={`Find and book cheap flights from ${from} to ${to}. Compare prices and get the best deals.`}
        keywords="cheap flights, flight booking, airline tickets, flight deals"
        canonical="/flights"
      />

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
                  Home › Flights › {from} to {to}
                </p>
                <h1 className="flights-title">
                  {loading ? 'Loading...' : `${flights.length} Flights Found`}
                </h1>
                <p className="flights-search-info">
                  {from} <ArrowRight size={16} /> {to}
                  {departureDate && ` • ${formatDate(departureDate)}`}
                  {returnDate && flightType === 'roundtrip' && ` - ${formatDate(returnDate)}`}
                  {' '}• {adults} {adults === '1' ? 'Passenger' : 'Passengers'}
                  {' '}• {flightClass.charAt(0).toUpperCase() + flightClass.slice(1)}
                </p>
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
                      <div className="flight-price-header">
                        <span className="price-amount">${flight.price}</span>
                        <span className="price-period">per person</span>
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

                      <Link to={`/flight/${flight.id}`} className="flight-card-button">View Details</Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && flights.length === 0 && (
              <div className="no-results">
                <h3>No flights found</h3>
                <p>Try adjusting your search criteria</p>
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
