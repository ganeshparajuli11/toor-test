import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Car, MapPin, Users, Briefcase, Fuel, Settings } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import './Cars.css';

const Cars = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract search parameters
  const pickupLocation = searchParams.get('pickupLocation') || 'Various Locations';
  const dropoffLocation = searchParams.get('dropoffLocation') || pickupLocation;
  const pickupDate = searchParams.get('pickupDate');
  const dropoffDate = searchParams.get('dropoffDate');
  const driverAge = searchParams.get('driverAge') || '30';

  // Demo car data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCars([
        {
          id: 1,
          name: 'Toyota Corolla',
          category: 'Economy',
          image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=300&fit=crop',
          passengers: 5,
          luggage: 2,
          transmission: 'Automatic',
          fuelType: 'Petrol',
          provider: 'Enterprise',
          rating: 4.5,
          reviews: 234,
          price: 45,
          features: ['AC', 'Bluetooth', 'USB Port']
        },
        {
          id: 2,
          name: 'Honda CR-V',
          category: 'SUV',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
          passengers: 7,
          luggage: 4,
          transmission: 'Automatic',
          fuelType: 'Hybrid',
          provider: 'Hertz',
          rating: 4.7,
          reviews: 189,
          price: 85,
          features: ['AC', 'Navigation', 'Bluetooth', 'Backup Camera']
        },
        {
          id: 3,
          name: 'BMW 3 Series',
          category: 'Luxury',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
          passengers: 5,
          luggage: 3,
          transmission: 'Automatic',
          fuelType: 'Petrol',
          provider: 'Sixt',
          rating: 4.9,
          reviews: 156,
          price: 125,
          features: ['AC', 'Navigation', 'Leather Seats', 'Sunroof']
        },
        {
          id: 4,
          name: 'Ford Transit Van',
          category: 'Van',
          image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&h=300&fit=crop',
          passengers: 12,
          luggage: 8,
          transmission: 'Manual',
          fuelType: 'Diesel',
          provider: 'Budget',
          rating: 4.4,
          reviews: 98,
          price: 95,
          features: ['AC', 'GPS', 'Large Capacity']
        },
        {
          id: 5,
          name: 'Tesla Model 3',
          category: 'Electric',
          image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop',
          passengers: 5,
          luggage: 2,
          transmission: 'Automatic',
          fuelType: 'Electric',
          provider: 'Enterprise',
          rating: 4.8,
          reviews: 267,
          price: 110,
          features: ['Autopilot', 'Navigation', 'Premium Sound']
        },
        {
          id: 6,
          name: 'Volkswagen Golf',
          category: 'Compact',
          image: 'https://images.unsplash.com/photo-1622353219448-46a8655d4b2e?w=400&h=300&fit=crop',
          passengers: 5,
          luggage: 2,
          transmission: 'Manual',
          fuelType: 'Petrol',
          provider: 'Avis',
          rating: 4.3,
          reviews: 145,
          price: 40,
          features: ['AC', 'Bluetooth', 'Fuel Efficient']
        }
      ]);
      setLoading(false);
    }, 800);
  }, [pickupLocation]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <SEO
        title={`Car Rentals in ${pickupLocation} | TOOR - Best Car Rental Deals`}
        description={`Find and book rental cars in ${pickupLocation}. Compare prices and get the best car rental deals.`}
        keywords="car rental, rent a car, car hire, vehicle rental, cheap car rental"
        canonical="/cars"
      />

      <div className="cars-page">
        <Header />

        {/* Search Section */}
        <div className="cars-search-section">
          <EnhancedSearch initialTab="car" showTabs={false} />
        </div>

        {/* Results Section */}
        <div className="cars-results-container">
          <div className="container">
            {/* Results Header */}
            <div className="cars-results-header">
              <div>
                <p className="cars-breadcrumb">
                  Home › Car Rentals › {pickupLocation}
                </p>
                <h1 className="cars-title">
                  {loading ? 'Loading...' : `${cars.length} Cars Available`}
                </h1>
                <p className="cars-search-info">
                  <MapPin size={16} /> Pick-up: {pickupLocation}
                  {pickupDate && ` • ${formatDate(pickupDate)}`}
                  {dropoffLocation !== pickupLocation && ` → Drop-off: ${dropoffLocation}`}
                  {dropoffDate && ` • ${formatDate(dropoffDate)}`}
                </p>
              </div>

              {/* Sort */}
              <div className="cars-sort">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" className="cars-sort-select">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Capacity</option>
                  <option>Rating: High to Low</option>
                </select>
              </div>
            </div>

            {/* Cars Grid */}
            <div className="cars-grid">
              {loading ? (
                // Skeleton loaders
                [...Array(6)].map((_, i) => (
                  <div key={i} className="car-card skeleton">
                    <div className="car-card-image skeleton-image"></div>
                    <div className="car-card-content">
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text short"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Car cards
                cars.map((car) => (
                  <div key={car.id} className="car-card">
                    <div className="car-card-image-wrapper">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="car-card-image"
                        loading="lazy"
                      />
                      <div className="car-card-category">{car.category}</div>
                      <div className="car-card-provider">{car.provider}</div>
                    </div>
                    <div className="car-card-content">
                      <h3 className="car-card-name">{car.name}</h3>
                      <div className="car-card-rating">
                        <span className="rating-value">{car.rating} ★</span>
                        <span className="rating-reviews">({car.reviews} reviews)</span>
                      </div>

                      <div className="car-card-specs">
                        <div className="car-spec">
                          <Users size={14} />
                          <span>{car.passengers} seats</span>
                        </div>
                        <div className="car-spec">
                          <Briefcase size={14} />
                          <span>{car.luggage} bags</span>
                        </div>
                        <div className="car-spec">
                          <Settings size={14} />
                          <span>{car.transmission}</span>
                        </div>
                        <div className="car-spec">
                          <Fuel size={14} />
                          <span>{car.fuelType}</span>
                        </div>
                      </div>

                      <div className="car-card-features">
                        {car.features.map((feature, index) => (
                          <span key={index} className="car-feature">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="car-card-footer">
                        <div className="car-card-price-wrapper">
                          <span className="price-amount">${car.price}</span>
                          <span className="price-period">/day</span>
                        </div>
                        <Link to={`/car/${car.id}`} className="car-card-button">View Details</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && cars.length === 0 && (
              <div className="no-results">
                <h3>No cars available</h3>
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

export default Cars;
