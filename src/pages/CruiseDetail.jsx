import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Ship, MapPin, Calendar, Users, Utensils, Dumbbell, Sparkles,
  Wifi, Music, Coffee, Wine, Check, ChevronRight, AlertCircle, Star
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './CruiseDetail.css';

const CruiseDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCabin, setSelectedCabin] = useState('oceanview');

  // Get cruise data from URL params (passed from listing page)
  const urlName = searchParams.get('name');
  const urlCruiseLine = searchParams.get('cruiseLine');
  const urlDestination = searchParams.get('destination');
  const urlDuration = searchParams.get('duration');
  const urlPorts = searchParams.get('ports');
  const urlRating = searchParams.get('rating');
  const urlReviews = searchParams.get('reviews');
  const urlPrice = searchParams.get('price');
  const urlImage = searchParams.get('image');

  const basePrice = parseInt(urlPrice) || 899;

  const cruise = {
    id: id,
    name: urlName || 'Mediterranean Dream Cruise',
    ship: `${urlCruiseLine || 'Royal'} Princess`,
    cruiseLine: urlCruiseLine || 'Royal Caribbean',
    destination: urlDestination || 'Mediterranean',
    duration: urlDuration || '7 Nights',
    departure: urlDestination ? `${urlDestination} Port` : 'Barcelona, Spain',
    departureDate: 'Mar 15, 2025',
    ports: [
      urlDestination || 'Barcelona, Spain',
      'Port 2',
      'Port 3',
      'Port 4',
      'Port 5',
      urlDestination || 'Barcelona, Spain'
    ],
    image: urlImage || 'https://images.unsplash.com/photo-1545134969-8a3cdfe2c89e?w=800&h=400&fit=crop',
    rating: parseFloat(urlRating) || 4.8,
    reviews: parseInt(urlReviews) || 1247,
    cabinTypes: {
      interior: {
        name: 'Interior Cabin',
        price: basePrice,
        size: '160 sq ft',
        occupancy: '2-3 guests',
        features: ['Queen bed', 'Private bathroom', 'TV', 'Safe']
      },
      oceanview: {
        name: 'Oceanview Cabin',
        price: Math.round(basePrice * 1.4),
        size: '180 sq ft',
        occupancy: '2-4 guests',
        features: ['Queen bed', 'Ocean view window', 'Private bathroom', 'TV', 'Mini fridge']
      },
      balcony: {
        name: 'Balcony Suite',
        price: Math.round(basePrice * 2.1),
        size: '220 sq ft',
        occupancy: '2-4 guests',
        features: ['King bed', 'Private balcony', 'Living area', 'Premium bathroom', 'Mini bar']
      },
      suite: {
        name: 'Grand Suite',
        price: Math.round(basePrice * 3.9),
        size: '350 sq ft',
        occupancy: '2-6 guests',
        features: ['King bed', 'Large balcony', 'Separate living room', 'Luxury bathroom', 'Butler service']
      }
    },
    inclusions: [
      'All meals and snacks',
      'Entertainment and shows',
      'Fitness center access',
      'Kids club',
      'Pool and hot tubs',
      'Complimentary room service'
    ],
    facilities: [
      { icon: <Utensils size={20} />, name: 'Dining' },
      { icon: <Dumbbell size={20} />, name: 'Fitness' },
      { icon: <Sparkles size={20} />, name: 'Spa' },
      { icon: <Wifi size={20} />, name: 'Wi-Fi' },
      { icon: <Music size={20} />, name: 'Entertainment' },
      { icon: <Wine size={20} />, name: 'Bars' },
      { icon: <Coffee size={20} />, name: 'Cafes' },
      { icon: <Users size={20} />, name: 'Kids Club' }
    ],
    cancellationPolicy: 'Free cancellation up to 60 days before departure. 50% refund between 30-60 days. Non-refundable within 30 days.'
  };

  const cabinOptions = [
    { id: 'interior', icon: '🛏️' },
    { id: 'oceanview', icon: '🌊' },
    { id: 'balcony', icon: '🏖️' },
    { id: 'suite', icon: '👑' }
  ];

  const selectedCabinData = cruise.cabinTypes[selectedCabin];

  const handleBooking = () => {
    navigate(`/cruise/${id}/book?cabin=${selectedCabin}`);
  };

  return (
    <>
      <SEO
        title={`${cruise.name} - ${cruise.cruiseLine} | Zanafly`}
        description={`Book ${cruise.duration} ${cruise.destination} cruise`}
        keywords="cruise booking, mediterranean cruise, cruise vacation"
        canonical={`/cruise/${id}`}
      />

      <div className="cruise-detail-page">
        <Header />

        <div className="cruise-detail-content">
          <div className="container">
            {/* Hero Image */}
            <div className="cruise-hero">
              <img src={cruise.image} alt={cruise.name} className="cruise-hero-image" />
              <div className="cruise-hero-overlay">
                <div className="cruise-hero-content">
                  <h1 className="cruise-title">{cruise.name}</h1>
                  <div className="cruise-meta">
                    <div className="cruise-meta-item">
                      <Ship size={20} />
                      <span>{cruise.ship}</span>
                    </div>
                    <div className="cruise-meta-item">
                      <Calendar size={20} />
                      <span>{cruise.duration}</span>
                    </div>
                    <div className="cruise-meta-item">
                      <MapPin size={20} />
                      <span>{cruise.departure}</span>
                    </div>
                    <div className="cruise-rating">
                      <Star size={16} fill="currentColor" />
                      <span>{cruise.rating}</span>
                      <span className="cruise-reviews">({cruise.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cruise-detail-layout">
              {/* Main Content */}
              <div className="cruise-detail-main">
                {/* Itinerary */}
                <div className="cruise-detail-card">
                  <h2 className="cruise-detail-card-title">
                    <MapPin size={24} />
                    Cruise Itinerary
                  </h2>

                  <div className="itinerary-timeline">
                    {cruise.ports.map((port, index) => (
                      <div key={index} className="itinerary-item">
                        <div className="itinerary-day">Day {index + 1}</div>
                        <div className="itinerary-dot"></div>
                        <div className="itinerary-port">{port}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cabin Selection */}
                <div className="cruise-detail-card">
                  <h2 className="cruise-detail-card-title">Select Your Cabin</h2>

                  <div className="cabin-options">
                    {cabinOptions.map((option) => {
                      const cabinData = cruise.cabinTypes[option.id];
                      return (
                        <div
                          key={option.id}
                          className={`cabin-option ${selectedCabin === option.id ? 'active' : ''}`}
                          onClick={() => setSelectedCabin(option.id)}
                        >
                          <div className="cabin-icon">{option.icon}</div>
                          <div className="cabin-details">
                            <h3 className="cabin-name">{cabinData.name}</h3>
                            <div className="cabin-info">
                              <span className="cabin-size">{cabinData.size}</span>
                              <span className="cabin-divider">•</span>
                              <span className="cabin-occupancy">{cabinData.occupancy}</span>
                            </div>
                            <div className="cabin-features">
                              {cabinData.features.map((feature, idx) => (
                                <span key={idx} className="cabin-feature">
                                  <Check size={14} />
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="cabin-price-section">
                            <div className="cabin-price">${cabinData.price}</div>
                            <div className="cabin-price-label">per person</div>
                            {selectedCabin === option.id && (
                              <Check size={24} className="cabin-selected" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* What's Included */}
                <div className="cruise-detail-card">
                  <h2 className="cruise-detail-card-title">
                    <Check size={24} />
                    What's Included
                  </h2>

                  <div className="inclusions-grid">
                    {cruise.inclusions.map((item, index) => (
                      <div key={index} className="inclusion-item">
                        <Check size={16} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div className="cruise-detail-card">
                  <h2 className="cruise-detail-card-title">
                    <Sparkles size={24} />
                    Onboard Facilities
                  </h2>

                  <div className="facilities-grid">
                    {cruise.facilities.map((facility, index) => (
                      <div key={index} className="facility-item">
                        {facility.icon}
                        <span>{facility.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="cruise-detail-card">
                  <h2 className="cruise-detail-card-title">
                    <AlertCircle size={24} />
                    Cancellation Policy
                  </h2>

                  <p className="policy-text">{cruise.cancellationPolicy}</p>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="cruise-detail-sidebar">
                <div className="booking-summary-card">
                  <h3 className="booking-summary-title">Booking Summary</h3>

                  <div className="booking-summary-item">
                    <span className="summary-label">Cruise</span>
                    <span className="summary-value">{cruise.name}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Duration</span>
                    <span className="summary-value">{cruise.duration}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Departure</span>
                    <span className="summary-value">{cruise.departureDate}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Cabin Type</span>
                    <span className="summary-value">{selectedCabinData.name}</span>
                  </div>

                  <div className="booking-summary-divider"></div>

                  <div className="booking-summary-total">
                    <span className="total-label">Price per Person</span>
                    <span className="total-value">${selectedCabinData.price}</span>
                  </div>

                  <button className="booking-btn-primary" onClick={handleBooking}>
                    Continue to Booking
                    <ChevronRight size={20} />
                  </button>

                  <div className="booking-note">
                    <AlertCircle size={16} />
                    <span>Prices exclude port fees and taxes</span>
                  </div>
                </div>

                {/* Why Book With Us */}
                <div className="cruise-detail-card info-card">
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
                      <span>Flexible Payment Plans</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>Free Travel Insurance</span>
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

export default CruiseDetail;
