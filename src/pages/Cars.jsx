import { useState, useEffect } from 'react';
import ratehawkService from '../services/ratehawk.service';
import { useSearchParams, Link } from 'react-router-dom';
import { Car, MapPin, Users, Briefcase, Fuel, Settings, Heart, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import ToastContainer, { showToast } from '../components/ToastContainer';
import { useLocation } from '../context/LocationContext';
import './Cars.css';

const Cars = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Get user location from context
  const { userLocation } = useLocation();

  // Extract search parameters
  const urlPickupLocation = searchParams.get('pickup') || '';
  const urlPickupId = searchParams.get('pickup_id') || '';
  const urlDropoffLocation = searchParams.get('dropoff') || '';
  const urlDropoffId = searchParams.get('dropoff_id') || '';
  const pickupDate = searchParams.get('pickupDate');
  const dropoffDate = searchParams.get('dropoffDate');
  const driverAge = searchParams.get('driverAge') || '30';

  // Use URL params or user's location
  const pickupLocation = urlPickupLocation || (userLocation?.city ? `${userLocation.city}, ${userLocation.country || ''}` : '');
  const pickupId = urlPickupId;
  const dropoffLocation = urlDropoffLocation || pickupLocation;
  const dropoffId = urlDropoffId || pickupId;

  // Check if search params exist (pickup_id is required for API search)
  const hasSearchParams = !!(pickupId);
  const hasUrlSearchParams = !!urlPickupLocation;

  // Fetch cars/transfers from RateHawk API
  useEffect(() => {
    if (!hasSearchParams) {
      setLoading(false);
      setCars([]);
      return;
    }

    const fetchCars = async () => {
      setLoading(true);
      try {
        const results = await ratehawkService.searchTransfers({
          pickupLocation,
          pickup_id: pickupId,
          dropoffLocation,
          dropoff_id: dropoffId,
          pickupDate,
          dropoffDate,
          passengers: 2
        });

        if (results && results.length > 0) {
          setCars(results);
          showToast(`Found ${results.length} vehicles via RateHawk!`, 'success');
        } else {
          // No results from API
          setCars([]);
          showToast('No vehicles found for this location. Try a different pickup location.', 'info');
        }
      } catch (error) {
        console.error('Car/transfer search error:', error);
        setCars([]);
        showToast('Car rental search is currently unavailable. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [pickupLocation, pickupId, dropoffLocation, dropoffId, pickupDate, dropoffDate, hasSearchParams]);


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

  const toggleFavorite = (carId) => {
    setFavorites((prev) =>
      prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId]
    );
  };

  const handleShare = (car) => {
    if (navigator.share) {
      navigator
        .share({
          title: car.name,
          text: `Check out this rental car: ${car.name}`,
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
        title={`Car Rentals in ${pickupLocation} | TOOR - Best Car Rental Deals`}
        description={`Find and book rental cars in ${pickupLocation}. Compare prices and get the best car rental deals.`}
        keywords="car rental, rent a car, car hire, vehicle rental, cheap car rental"
        canonical="/cars"
      />

      <ToastContainer />

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
                  Home › Car Rentals{hasSearchParams ? ` › ${pickupLocation}` : ''}
                </p>
                <h1 className="cars-title">
                  {!hasSearchParams ? 'Search for Car Rentals' :
                   loading ? 'Searching cars...' : `${cars.length} Cars Available`}
                </h1>
                {hasSearchParams ? (
                  <p className="cars-search-info">
                    <MapPin size={16} /> Pick-up: {pickupLocation}
                    {pickupDate && ` • ${formatDate(pickupDate)}`}
                    {dropoffLocation !== pickupLocation && ` → Drop-off: ${dropoffLocation}`}
                    {dropoffDate && ` • ${formatDate(dropoffDate)}`}
                  </p>
                ) : (
                  <p className="cars-search-info">
                    Use the search above to find car rentals
                  </p>
                )}
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
                      />
                      <div className="car-card-category">{car.category}</div>
                      <div className="car-card-provider">{car.provider}</div>
                      <div className="card-action-buttons">
                        <button
                          className={`card-action-button favorite-button ${favorites.includes(car.id) ? 'active' : ''
                            }`}
                          onClick={() => toggleFavorite(car.id)}
                          aria-label="Add to favorites"
                        >
                          <Heart
                            size={20}
                            fill={favorites.includes(car.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          className="card-action-button share-button"
                          onClick={() => handleShare(car)}
                          aria-label="Share"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
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
                        <Link
                          to={`/car/${car.id}?name=${encodeURIComponent(car.name)}&category=${encodeURIComponent(car.category)}&image=${encodeURIComponent(car.image)}&passengers=${car.passengers}&luggage=${car.luggage}&transmission=${encodeURIComponent(car.transmission)}&fuelType=${encodeURIComponent(car.fuelType)}&provider=${encodeURIComponent(car.provider)}&rating=${car.rating}&reviews=${car.reviews}&price=${car.price}`}
                          className="car-card-button"
                        >View Details</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && cars.length === 0 && hasSearchParams && (
              <div className="no-results">
                <h3>No cars available</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}

            {/* No Search Yet */}
            {!loading && !hasSearchParams && (
              <div className="no-results">
                <h3>Enter your pickup location</h3>
                <p>Use the search form above to find available car rentals</p>
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
