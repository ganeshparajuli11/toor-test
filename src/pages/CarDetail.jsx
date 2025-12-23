import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car, Users, Briefcase, Fuel, Zap, Navigation, Shield, Check,
  ChevronRight, AlertCircle, MapPin, Calendar, Star
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './CarDetail.css';

const CarDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedProtection, setSelectedProtection] = useState('basic');

  // Get car data from URL params (passed from listing page)
  const urlName = searchParams.get('name');
  const urlCategory = searchParams.get('category');
  const urlImage = searchParams.get('image');
  const urlPassengers = searchParams.get('passengers');
  const urlLuggage = searchParams.get('luggage');
  const urlTransmission = searchParams.get('transmission');
  const urlFuelType = searchParams.get('fuelType');
  const urlProvider = searchParams.get('provider');
  const urlRating = searchParams.get('rating');
  const urlReviews = searchParams.get('reviews');
  const urlPrice = searchParams.get('price');

  const basePrice = parseInt(urlPrice) || 75;

  const car = {
    id: id,
    name: urlName || 'Toyota Camry 2024',
    category: urlCategory || 'Sedan',
    image: urlImage || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop',
    rating: parseFloat(urlRating) || 4.7,
    reviews: parseInt(urlReviews) || 328,
    provider: urlProvider || 'Enterprise',
    specs: {
      passengers: parseInt(urlPassengers) || 5,
      luggage: parseInt(urlLuggage) || 3,
      transmission: urlTransmission || 'Automatic',
      fuelType: urlFuelType || 'Hybrid',
      airConditioning: true,
      doors: 4
    },
    features: [
      'GPS Navigation',
      'Bluetooth',
      'Backup Camera',
      'Apple CarPlay',
      'Android Auto',
      'Cruise Control',
      'USB Charging',
      'Keyless Entry'
    ],
    pricePerDay: basePrice,
    protection: {
      basic: {
        name: 'Basic Protection',
        price: 0,
        features: ['Basic liability coverage', 'Roadside assistance']
      },
      standard: {
        name: 'Standard Protection',
        price: Math.round(basePrice * 0.2),
        features: ['Collision damage waiver', 'Theft protection', 'Roadside assistance']
      },
      premium: {
        name: 'Premium Protection',
        price: Math.round(basePrice * 0.35),
        features: ['Full coverage', 'Zero deductible', 'Personal effects coverage', '24/7 support']
      }
    },
    pickupLocation: urlProvider ? `${urlProvider} Location` : 'Los Angeles International Airport',
    policies: {
      fuel: 'Full to Full - Pick up and return with a full tank',
      mileage: 'Unlimited mileage included',
      driver: 'Minimum age: 25 years. Valid driver\'s license required.',
      cancellation: 'Free cancellation up to 48 hours before pickup'
    }
  };

  const protectionOptions = [
    { id: 'basic', icon: <Shield size={20} /> },
    { id: 'standard', icon: <Shield size={20} /> },
    { id: 'premium', icon: <Shield size={20} /> }
  ];

  const selectedProtectionData = car.protection[selectedProtection];
  const totalPerDay = car.pricePerDay + selectedProtectionData.price;

  const handleBooking = () => {
    navigate(`/car/${id}/book?protection=${selectedProtection}`);
  };

  return (
    <>
      <SEO
        title={`${car.name} Rental | Zanafly`}
        description={`Rent ${car.name} - ${car.category} with ${car.specs.passengers} seats`}
        keywords="car rental, vehicle rental, car hire"
        canonical={`/car/${id}`}
      />

      <div className="car-detail-page">
        <Header />

        <div className="car-detail-content">
          <div className="container">
            {/* Car Header */}
            <div className="car-detail-header">
              <div className="car-header-left">
                <div className="car-category">{car.category}</div>
                <h1 className="car-title">{car.name}</h1>
                <div className="car-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{car.rating}</span>
                  <span className="car-reviews">({car.reviews} reviews)</span>
                </div>
              </div>
              <div className="car-price-box">
                <span className="car-price-value">${totalPerDay}</span>
                <span className="car-price-unit">per day</span>
              </div>
            </div>

            {/* Car Image */}
            <div className="car-image-section">
              <img src={car.image} alt={car.name} className="car-main-image" />
            </div>

            <div className="car-detail-layout">
              {/* Main Content */}
              <div className="car-detail-main">
                {/* Specifications */}
                <div className="car-detail-card">
                  <h2 className="car-detail-card-title">Vehicle Specifications</h2>

                  <div className="car-specs-grid">
                    <div className="spec-item">
                      <Users size={24} />
                      <span className="spec-label">Passengers</span>
                      <span className="spec-value">{car.specs.passengers}</span>
                    </div>
                    <div className="spec-item">
                      <Briefcase size={24} />
                      <span className="spec-label">Luggage</span>
                      <span className="spec-value">{car.specs.luggage} bags</span>
                    </div>
                    <div className="spec-item">
                      <Zap size={24} />
                      <span className="spec-label">Transmission</span>
                      <span className="spec-value">{car.specs.transmission}</span>
                    </div>
                    <div className="spec-item">
                      <Fuel size={24} />
                      <span className="spec-label">Fuel Type</span>
                      <span className="spec-value">{car.specs.fuelType}</span>
                    </div>
                    <div className="spec-item">
                      <Car size={24} />
                      <span className="spec-label">Doors</span>
                      <span className="spec-value">{car.specs.doors}</span>
                    </div>
                    <div className="spec-item">
                      <Zap size={24} />
                      <span className="spec-label">AC</span>
                      <span className="spec-value">{car.specs.airConditioning ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="car-detail-card">
                  <h2 className="car-detail-card-title">Features & Amenities</h2>

                  <div className="car-features-grid">
                    {car.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <Check size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protection Plans */}
                <div className="car-detail-card">
                  <h2 className="car-detail-card-title">Protection Plans</h2>

                  <div className="protection-options">
                    {protectionOptions.map((option) => {
                      const protectionData = car.protection[option.id];
                      return (
                        <div
                          key={option.id}
                          className={`protection-option ${selectedProtection === option.id ? 'active' : ''}`}
                          onClick={() => setSelectedProtection(option.id)}
                        >
                          <div className="protection-header">
                            <div className="protection-icon">{option.icon}</div>
                            <div className="protection-info">
                              <h3 className="protection-name">{protectionData.name}</h3>
                              <div className="protection-price">
                                {protectionData.price > 0 ? `+$${protectionData.price}/day` : 'Included'}
                              </div>
                            </div>
                            {selectedProtection === option.id && (
                              <Check size={24} className="protection-selected" />
                            )}
                          </div>
                          <div className="protection-features">
                            {protectionData.features.map((feature, idx) => (
                              <div key={idx} className="protection-feature">
                                <Check size={14} />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rental Policies */}
                <div className="car-detail-card">
                  <h2 className="car-detail-card-title">
                    <AlertCircle size={24} />
                    Rental Policies
                  </h2>

                  <div className="policies-grid">
                    <div className="policy-item">
                      <h3>Fuel Policy</h3>
                      <p>{car.policies.fuel}</p>
                    </div>
                    <div className="policy-item">
                      <h3>Mileage</h3>
                      <p>{car.policies.mileage}</p>
                    </div>
                    <div className="policy-item">
                      <h3>Driver Requirements</h3>
                      <p>{car.policies.driver}</p>
                    </div>
                    <div className="policy-item">
                      <h3>Cancellation</h3>
                      <p>{car.policies.cancellation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="car-detail-sidebar">
                <div className="booking-summary-card">
                  <h3 className="booking-summary-title">Booking Summary</h3>

                  <div className="booking-summary-item">
                    <span className="summary-label">Vehicle</span>
                    <span className="summary-value">{car.name}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Pickup Location</span>
                    <span className="summary-value">{car.pickupLocation}</span>
                  </div>

                  <div className="booking-summary-item">
                    <span className="summary-label">Protection</span>
                    <span className="summary-value">{selectedProtectionData.name}</span>
                  </div>

                  <div className="booking-summary-divider"></div>

                  <div className="pricing-breakdown">
                    <div className="pricing-item">
                      <span>Base Rate</span>
                      <span>${car.pricePerDay}/day</span>
                    </div>
                    {selectedProtectionData.price > 0 && (
                      <div className="pricing-item">
                        <span>Protection</span>
                        <span>+${selectedProtectionData.price}/day</span>
                      </div>
                    )}
                  </div>

                  <div className="booking-summary-divider"></div>

                  <div className="booking-summary-total">
                    <span className="total-label">Total per Day</span>
                    <span className="total-value">${totalPerDay}</span>
                  </div>

                  <button className="booking-btn-primary" onClick={handleBooking}>
                    Continue to Booking
                    <ChevronRight size={20} />
                  </button>

                  <div className="booking-note">
                    <AlertCircle size={16} />
                    <span>Final price calculated at checkout</span>
                  </div>
                </div>

                {/* Why Book With Us */}
                <div className="car-detail-card info-card">
                  <h3 className="info-card-title">Why Book With Us?</h3>
                  <ul className="info-list">
                    <li>
                      <Check size={16} />
                      <span>Best Price Guarantee</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>24/7 Roadside Assistance</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>Free Cancellation</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>No Hidden Fees</span>
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

export default CarDetail;
