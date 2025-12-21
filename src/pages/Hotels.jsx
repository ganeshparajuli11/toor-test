import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Tv, Wind, Heart, Share2, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import ToastContainer, { showToast } from '../components/ToastContainer';
import ImageSlider from '../components/ImageSlider';
import ratehawkService from '../services/ratehawk.service';
import { useLocation } from '../context/LocationContext';
import './Hotels.css';

// Default popular destinations to show when no search
const DEFAULT_DESTINATIONS = [
  { dest_id: '2621', label: 'New York, United States', search_type: 'City' },
  { dest_id: '6053839', label: 'Dubai, UAE', search_type: 'City' },
  { dest_id: '2734', label: 'Paris, France', search_type: 'City' },
  { dest_id: '2114', label: 'London, United Kingdom', search_type: 'City' },
];

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isDefaultSearch, setIsDefaultSearch] = useState(false);
  const [defaultDestination, setDefaultDestination] = useState(DEFAULT_DESTINATIONS[0]);

  const { userLocation } = useLocation();

  // Extract search parameters from URL
  const urlLocation = searchParams.get('location') || '';
  const urlDestId = searchParams.get('dest_id');
  const urlSearchType = searchParams.get('search_type') || 'CITY';
  const checkIn = searchParams.get('checkIn') || getDefaultCheckIn();
  const checkOut = searchParams.get('checkOut') || getDefaultCheckOut();
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;
  const rooms = searchParams.get('rooms') || 1;

  function getDefaultCheckIn() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  function getDefaultCheckOut() {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date.toISOString().split('T')[0];
  }

  const selectedLocation = urlDestId ? {
    dest_id: urlDestId,
    search_type: urlSearchType,
    label: urlLocation,
    name: urlLocation.split(',')[0]
  } : (userLocation && userLocation.city) ? {
    dest_id: userLocation.city,
    search_type: 'REGION',
    label: userLocation.displayName,
    name: userLocation.city,
    useUserLocation: true
  } : null;

  const currentLocation = selectedLocation?.name || selectedLocation?.label || '';
  const hasSearchParams = !!urlDestId || (selectedLocation?.useUserLocation && userLocation);

  // Fetch hotels from RateHawk API
  useEffect(() => {
    const fetchHotels = async (location, isDefault = false) => {
      setLoading(true);
      setError(null);
      setUseFallback(false);
      setSearchProgress(0);
      setIsDefaultSearch(isDefault);

      // Animate progress bar
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      try {
        const params = {
          destination: location.dest_id,
          checkIn: checkIn.split('T')[0],
          checkOut: checkOut.split('T')[0],
          guests: parseInt(adults),
          rooms: parseInt(rooms),
          currency: 'USD'
        };

        const results = await ratehawkService.searchHotels(params);
        setSearchProgress(100);

        console.log('Backend API Response:', results);
        if (results && results.length > 0) {
          console.log('Hotels with images:', results.map(h => ({
            id: h.id,
            name: h.name,
            image: h.image,
            imagesCount: h.images?.length || 0,
            firstImage: h.images?.[0]?.substring(0, 60)
          })));
        }

        if (results && results.length > 0) {
          setHotels(results);
          const locationName = isDefault ? location.label : currentLocation;
          showToast(`Found ${results.length} hotels in ${locationName}!`, 'success');
        } else {
          setHotels([]);
          showToast('No hotels found for these dates. Try different dates.', 'info');
        }
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError(err.message);
        setUseFallback(true);
        loadFallbackData();
        showToast('Using demo data. Please check your RateHawk API credentials.', 'info');
      } finally {
        clearInterval(progressInterval);
        setSearchProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };

    // If user searched for a specific location
    if (selectedLocation && checkIn && checkOut) {
      fetchHotels(selectedLocation, false);
    }
    // If no search params, load default suggested hotels
    else if (!urlDestId && checkIn && checkOut) {
      fetchHotels(defaultDestination, true);
    }
  }, [urlDestId, urlLocation, urlSearchType, userLocation, checkIn, checkOut, adults, children, rooms, defaultDestination]);

  const loadFallbackData = () => {
    setHotels([
      {
        id: 1,
        name: 'Grand Plaza Hotel',
        location: currentLocation,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        rating: 4.8,
        reviewScore: 9.2,
        reviews: 245,
        price: 120,
        currency: 'USD',
        amenities: ['Free WiFi', 'Breakfast', 'Pool', 'AC'],
        description: 'Luxury hotel with stunning views and excellent service'
      },
      {
        id: 2,
        name: 'Ocean View Resort',
        location: currentLocation,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
        rating: 4.6,
        reviewScore: 8.8,
        reviews: 189,
        price: 95,
        currency: 'USD',
        amenities: ['Free WiFi', 'Beach Access', 'Restaurant', 'AC'],
        description: 'Beautiful beachfront property perfect for relaxation'
      },
      {
        id: 3,
        name: 'City Center Inn',
        location: currentLocation,
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop',
        rating: 4.5,
        reviewScore: 8.5,
        reviews: 312,
        price: 80,
        currency: 'USD',
        amenities: ['Free WiFi', 'Parking', 'Breakfast', 'Gym'],
        description: 'Conveniently located in the heart of the city'
      },
      {
        id: 4,
        name: 'Mountain Lodge',
        location: currentLocation,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
        rating: 4.9,
        reviewScore: 9.5,
        reviews: 156,
        price: 150,
        currency: 'USD',
        amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Hiking'],
        description: 'Peaceful mountain retreat with breathtaking scenery'
      },
      {
        id: 5,
        name: 'Downtown Boutique Hotel',
        location: currentLocation,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
        rating: 4.7,
        reviewScore: 9.0,
        reviews: 203,
        price: 110,
        currency: 'USD',
        amenities: ['Free WiFi', 'Bar', 'Rooftop', 'AC'],
        description: 'Stylish boutique hotel with modern amenities'
      },
      {
        id: 6,
        name: 'Garden Suites',
        location: currentLocation,
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
        rating: 4.4,
        reviewScore: 8.2,
        reviews: 178,
        price: 75,
        currency: 'USD',
        amenities: ['Free WiFi', 'Garden', 'Parking', 'Breakfast'],
        description: 'Tranquil garden setting with comfortable accommodations'
      }
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleFavorite = (hotelId) => {
    setFavorites((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleShare = (hotel) => {
    if (navigator.share) {
      navigator
        .share({
          title: hotel.name,
          text: `Check out this hotel: ${hotel.name}`,
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
        title={`Hotels in ${currentLocation} | TOOR - Find Your Perfect Stay`}
        description={`Find and book the best hotels in ${currentLocation}. Compare prices, read reviews, and get the best deals.`}
        keywords="hotel booking, hotels, accommodation, best hotel deals"
        canonical="/hotels"
      />

      <ToastContainer />

      <div className="hotels-page">
        <Header />

        {/* Search Section */}
        <div className="hotels-search-section">
          <EnhancedSearch initialTab="hotel" showTabs={false} />
        </div>

        {/* Loading Progress Bar */}
        {loading && (
          <div className="hotels-progress-container">
            <div
              className="hotels-progress-bar"
              style={{ width: `${searchProgress}%` }}
            />
          </div>
        )}

        {/* Results Section */}
        <div className="hotels-results-container">
          <div className="container">
            {/* API Status Banner */}
            {!loading && hasSearchParams && (
              <div className={`hotels-status-banner ${useFallback ? 'warning' : 'success'} fade-in`}>
                <strong>{useFallback ? 'Demo Mode' : 'Live RateHawk API'}</strong>
                <span>
                  {useFallback
                    ? 'Using demo data. Configure RateHawk API keys in Admin Settings.'
                    : `Showing real hotel data from RateHawk API for ${currentLocation}`
                  }
                </span>
              </div>
            )}

            {/* Results Header */}
            <div className="hotels-results-header fade-in">
              <div>
                <p className="hotels-breadcrumb">
                  Home &rsaquo; Hotels{(currentLocation || isDefaultSearch) ? ` in ${currentLocation || defaultDestination.label}` : ''}
                </p>
                <h1 className="hotels-title">
                  {loading ? (
                    <span className="loading-text">
                      <Loader2 className="spinner" size={24} />
                      Searching hotels...
                    </span>
                  ) : isDefaultSearch ? (
                    `Suggested Hotels in ${defaultDestination.label}`
                  ) : hasSearchParams ? (
                    `${hotels.length} Hotels Found in ${currentLocation}`
                  ) : (
                    'Search for Hotels'
                  )}
                  {(hasSearchParams || isDefaultSearch) && checkIn && checkOut && !loading && (
                    <span className="hotels-dates">
                      {' '}for {formatDate(checkIn)} - {formatDate(checkOut)}
                    </span>
                  )}
                </h1>
                {(hasSearchParams || isDefaultSearch) && (
                  <p className="hotels-search-info">
                    {rooms} {rooms === '1' ? 'Room' : 'Rooms'} &bull; {adults} {adults === '1' ? 'Adult' : 'Adults'}
                    {children !== '0' && ` &bull; ${children} ${children === '1' ? 'Child' : 'Children'}`}
                  </p>
                )}
                {isDefaultSearch && !loading && (
                  <>
                    <p className="hotels-suggestion-hint">
                      Or explore hotels in popular destinations:
                    </p>
                    <div className="destination-switcher">
                      {DEFAULT_DESTINATIONS.map((dest) => (
                        <button
                          key={dest.dest_id}
                          className={`destination-btn ${defaultDestination.dest_id === dest.dest_id ? 'active' : ''}`}
                          onClick={() => setDefaultDestination(dest)}
                        >
                          {dest.label.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {!hasSearchParams && !isDefaultSearch && (
                  <p className="hotels-search-info">
                    Use the search above to find hotels
                  </p>
                )}
              </div>

              {/* Sort */}
              <div className="hotels-sort">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" className="hotels-sort-select">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>

            {/* Hotels Grid */}
            <div className="hotels-grid">
              {loading ? (
                // Skeleton loaders with staggered animation
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="hotel-card skeleton"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="hotel-card-image-wrapper">
                      <div className="skeleton-image"></div>
                    </div>
                    <div className="hotel-card-content">
                      <div className="skeleton-text" style={{ width: '70%' }}></div>
                      <div className="skeleton-text" style={{ width: '50%' }}></div>
                      <div className="skeleton-text" style={{ width: '90%' }}></div>
                      <div className="skeleton-amenities">
                        <div className="skeleton-tag"></div>
                        <div className="skeleton-tag"></div>
                        <div className="skeleton-tag"></div>
                      </div>
                      <div className="skeleton-footer">
                        <div className="skeleton-price"></div>
                        <div className="skeleton-button"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : hotels.length > 0 ? (
                // Hotel cards with staggered animation
                hotels.map((hotel, index) => (
                  <div
                    key={hotel.id}
                    className="hotel-card fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="hotel-card-image-wrapper">
                      <ImageSlider
                        images={hotel.images}
                        alt={hotel.name}
                        className="hotel-card-image"
                      />
                      <div className="hotel-card-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{hotel.rating}</span>
                      </div>
                      <div className="card-action-buttons">
                        <button
                          className={`card-action-button favorite-button ${favorites.includes(hotel.id) ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); toggleFavorite(hotel.id); }}
                          aria-label="Add to favorites"
                        >
                          <Heart
                            size={20}
                            fill={favorites.includes(hotel.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          className="card-action-button share-button"
                          onClick={(e) => { e.preventDefault(); handleShare(hotel); }}
                          aria-label="Share"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="hotel-card-content">
                      <h3 className="hotel-card-name">{hotel.name}</h3>
                      <p className="hotel-card-location">
                        <MapPin size={14} />
                        {hotel.location}
                      </p>
                      <p className="hotel-card-description">{hotel.description}</p>

                      <div className="hotel-card-amenities">
                        {(hotel.amenities || []).slice(0, 4).map((amenity, i) => (
                          <span key={i} className="hotel-amenity">
                            {amenity === 'Free WiFi' && <Wifi size={14} />}
                            {amenity === 'Breakfast' && <Coffee size={14} />}
                            {amenity === 'AC' && <Wind size={14} />}
                            {amenity === 'Pool' && <Tv size={14} />}
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="hotel-card-footer">
                        <div className="hotel-card-reviews">
                          <span className="review-score">
                            {hotel.reviewScore >= 9 ? 'Exceptional' :
                             hotel.reviewScore >= 8 ? 'Excellent' :
                             hotel.reviewScore >= 7 ? 'Very Good' :
                             hotel.reviewScore >= 6 ? 'Good' :
                             hotel.reviewScore > 0 ? 'Fair' : 'No rating'}
                          </span>
                          <span className="review-count">
                            {hotel.reviewScore > 0 && <strong>{hotel.reviewScore.toFixed(1)}</strong>}
                            {hotel.reviews > 0 ? ` (${hotel.reviews} reviews)` : ''}
                          </span>
                        </div>
                        <div className="hotel-card-price-wrapper">
                          <div className="hotel-card-price">
                            <span className="price-label">From</span>
                            <span className="price-amount">
                              {hotel.currency && hotel.currency !== 'USD' ? hotel.currency : '$'}{hotel.price || 'N/A'}
                            </span>
                            <span className="price-period">/night</span>
                          </div>
                          <Link
                            to={`/property/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}&price=${hotel.price || 0}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(hotel.location)}&rating=${hotel.rating}&reviews=${hotel.reviews}&reviewScore=${hotel.reviewScore || 0}&image=${encodeURIComponent(hotel.image)}`}
                            className="hotel-card-button"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : hasSearchParams ? (
                <div className="no-results fade-in">
                  <h3>No hotels found</h3>
                  <p>Try adjusting your search criteria or dates</p>
                </div>
              ) : (
                <div className="no-results fade-in">
                  <h3>Enter your destination</h3>
                  <p>Use the search form above to find available hotels</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Hotels;
