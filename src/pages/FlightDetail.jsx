import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plane, Clock, Calendar, Users, Briefcase, Coffee, Wifi,
  Monitor, Award, ChevronRight, Check, AlertCircle, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './FlightDetail.css';

const FlightDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || 'economy');

  // Get flight data from URL params (passed from listing page)
  const urlAirline = searchParams.get('airline');
  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');
  const urlDepartureTime = searchParams.get('departureTime');
  const urlArrivalTime = searchParams.get('arrivalTime');
  const urlDuration = searchParams.get('duration');
  const urlStops = searchParams.get('stops');
  const urlPrice = searchParams.get('price');

  // Use URL params if available, otherwise use fallback
  const flight = {
    id: id,
    airline: urlAirline || 'Emirates',
    flightNumber: `${(urlAirline || 'EM').substring(0, 2).toUpperCase()} ${id}`,
    from: urlFrom || 'New York (JFK)',
    to: urlTo || 'Dubai (DXB)',
    departureTime: urlDepartureTime || '10:30 AM',
    arrivalTime: urlArrivalTime || '6:45 PM',
    departureDate: 'Jan 15, 2025',
    arrivalDate: 'Jan 16, 2025',
    duration: urlDuration || '12h 15m',
    stops: urlStops || 'Non-stop',
    aircraft: 'Boeing 777-300ER',
    price: parseInt(urlPrice) || 850,
    logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop',
    classes: {
      economy: {
        price: parseInt(urlPrice) || 850,
        seats: 12,
        baggage: '23kg',
        features: ['Standard seat', 'In-flight meals', 'Entertainment system']
      },
      premiumEconomy: {
        price: Math.round((parseInt(urlPrice) || 850) * 1.5),
        seats: 8,
        baggage: '32kg',
        features: ['Extra legroom', 'Premium meals', 'Priority boarding', 'Enhanced entertainment']
      },
      business: {
        price: Math.round((parseInt(urlPrice) || 850) * 4),
        seats: 4,
        baggage: '40kg',
        features: ['Lie-flat seat', 'Gourmet dining', 'Lounge access', 'Priority everything']
      },
      first: {
        price: Math.round((parseInt(urlPrice) || 850) * 8),
        seats: 2,
        baggage: '50kg',
        features: ['Private suite', 'On-demand dining', 'Chauffeur service', 'Luxury amenities']
      }
    },
    amenities: [
      { icon: <Wifi size={20} />, name: 'Wi-Fi', available: true },
      { icon: <Monitor size={20} />, name: 'Entertainment', available: true },
      { icon: <Coffee size={20} />, name: 'Meals', available: true },
      { icon: <Briefcase size={20} />, name: 'Extra Baggage', available: true },
    ],
    baggagePolicy: {
      cabin: '7kg carry-on bag',
      checked: '23kg checked bag (Economy), 32kg (Premium Economy), 40kg (Business), 50kg (First)'
    },
    cancellationPolicy: 'Free cancellation up to 24 hours before departure. 50% refund between 24-48 hours. Non-refundable within 24 hours.'
  };

  const classOptions = [
    { id: 'economy', name: 'Economy', icon: '💺' },
    { id: 'premiumEconomy', name: 'Premium Economy', icon: '✨' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'first', name: 'First Class', icon: '👑' }
  ];

  const handleBooking = () => {
    navigate(`/flight/${id}/book?class=${selectedClass}`);
  };

  const selectedClassData = flight.classes[selectedClass];

  return (
    <>
      <SEO
        title={`${flight.from} to ${flight.to} - ${flight.airline} | Zanafly`}
        description={`Book ${flight.airline} flight from ${flight.from} to ${flight.to}`}
        keywords="flight booking, airline tickets, international flights"
        canonical={`/flight/${id}`}
      />

      <div className="flight-detail-page">
        <Header />

        <div className="flight-detail-content">
          <div className="container">
            {/* Flight Header */}
            <div className="flight-detail-header">
              <div className="flight-detail-airline">
                <img src={flight.logo} alt={flight.airline} className="airline-logo-large" />
                <div>
                  <h1 className="flight-detail-title">{flight.from} → {flight.to}</h1>
                  <p className="flight-detail-subtitle">
                    {flight.airline} • {flight.flightNumber} • {flight.aircraft}
                  </p>
                </div>
              </div>
              <div className="flight-detail-price-box">
                <span className="flight-detail-price-label">Starting from</span>
                <span className="flight-detail-price-value">${selectedClassData.price}</span>
                <span className="flight-detail-price-unit">per person</span>
              </div>
            </div>

            <div className="flight-detail-layout">
              {/* Main Content */}
              <div className="flight-detail-main">
                {/* Flight Timeline */}
                <div className="flight-detail-card">
                  <h2 className="flight-detail-card-title">Flight Details</h2>

                  <div className="flight-timeline">
                    <div className="flight-timeline-point">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-location">
                          <MapPin size={20} />
                          <span>{flight.from}</span>
                        </div>
                        <div className="timeline-time">{flight.departureTime}</div>
                        <div className="timeline-date">{flight.departureDate}</div>
                      </div>
                    </div>

                    <div className="flight-timeline-duration">
                      <div className="duration-line"></div>
                      <div className="duration-info">
                        <Plane size={24} className="duration-icon" />
                        <span>{flight.duration}</span>
                        <span className="duration-stops">{flight.stops}</span>
                      </div>
                    </div>

                    <div className="flight-timeline-point">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-location">
                          <MapPin size={20} />
                          <span>{flight.to}</span>
                        </div>
                        <div className="timeline-time">{flight.arrivalTime}</div>
                        <div className="timeline-date">{flight.arrivalDate}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Class Selection */}
                <div className="flight-detail-card">
                  <h2 className="flight-detail-card-title">Select Travel Class</h2>

                  <div className="class-options">
                    {classOptions.map((option) => {
                      const classData = flight.classes[option.id];
                      return (
                        <div
                          key={option.id}
                          className={`class-option ${selectedClass === option.id ? 'active' : ''} ${classData.seats === 0 ? 'disabled' : ''}`}
                          onClick={() => classData.seats > 0 && setSelectedClass(option.id)}
                        >
                          <div className="class-option-header">
                            <span className="class-icon">{option.icon}</span>
                            <span className="class-name">{option.name}</span>
                            {selectedClass === option.id && <Check size={20} className="class-check" />}
                          </div>
                          <div className="class-price">${classData.price}</div>
                          <div className="class-seats">
                            {classData.seats > 0 ? `${classData.seats} seats left` : 'Sold out'}
                          </div>
                          <div className="class-features">
                            {classData.features.map((feature, idx) => (
                              <div key={idx} className="class-feature">
                                <Check size={14} />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                          <div className="class-baggage">
                            <Briefcase size={16} />
                            <span>{classData.baggage} baggage</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amenities */}
                <div className="flight-detail-card">
                  <h2 className="flight-detail-card-title">Amenities & Services</h2>

                  <div className="flight-amenities-grid">
                    {flight.amenities.map((amenity, index) => (
                      <div key={index} className={`amenity-item ${amenity.available ? 'available' : 'unavailable'}`}>
                        {amenity.icon}
                        <span>{amenity.name}</span>
                        {amenity.available && <Check size={16} className="amenity-check" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Baggage Policy */}
                <div className="flight-detail-card">
                  <h2 className="flight-detail-card-title">Baggage Policy</h2>

                  <div className="policy-section">
                    <div className="policy-item">
                      <Briefcase size={20} />
                      <div>
                        <h3>Cabin Baggage</h3>
                        <p>{flight.baggagePolicy.cabin}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <Briefcase size={20} />
                      <div>
                        <h3>Checked Baggage</h3>
                        <p>{flight.baggagePolicy.checked}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="flight-detail-card">
                  <h2 className="flight-detail-card-title">
                    <AlertCircle size={20} />
                    Cancellation Policy
                  </h2>

                  <p className="policy-text">{flight.cancellationPolicy}</p>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="flight-detail-sidebar">
                <div className="booking-summary-card">
                  <h3 className="booking-summary-title">Booking Summary</h3>

                  <div className="booking-summary-item">
                    <span className="summary-label">Route</span>
                    <span className="summary-value">{flight.from} → {flight.to}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Date</span>
                    <span className="summary-value">{flight.departureDate}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Class</span>
                    <span className="summary-value">
                      {classOptions.find(c => c.id === selectedClass)?.name}
                    </span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Baggage</span>
                    <span className="summary-value">{selectedClassData.baggage}</span>
                  </div>

                  <div className="booking-summary-divider"></div>

                  <div className="booking-summary-total">
                    <span className="total-label">Total Price</span>
                    <span className="total-value">${selectedClassData.price}</span>
                  </div>

                  <button className="booking-btn-primary" onClick={handleBooking}>
                    Continue to Booking
                    <ChevronRight size={20} />
                  </button>

                  <div className="booking-note">
                    <AlertCircle size={16} />
                    <span>Prices may change based on availability</span>
                  </div>
                </div>

                {/* Why Book With Us */}
                <div className="flight-detail-card info-card">
                  <h3 className="info-card-title">Why Book With Us?</h3>
                  <ul className="info-list">
                    <li>
                      <Check size={16} />
                      <span>Best Price Guarantee</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>24/7 Customer Support</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>Instant Confirmation</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>Secure Payment</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default FlightDetail;
