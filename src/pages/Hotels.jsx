import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Tv, Wind, Heart, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import ToastContainer, { showToast } from '../components/ToastContainer';
import useApi from '../hooks/useApi';
import { API_ENDPOINTS } from '../config/api';
import './Hotels.css';

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [useFallback, setUseFallback] = useState(false);

  // Extract search parameters
  const location = searchParams.get('location') || 'Paris'; // Default to Paris
  const checkIn = searchParams.get('checkIn') || getDefaultCheckIn();
  const checkOut = searchParams.get('checkOut') || getDefaultCheckOut();
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;
  const rooms = searchParams.get('rooms') || 1;

  // Helper functions for default dates (7 days from now for check-in, 10 days for check-out)
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

  // Prepare RateHawk API body
  const apiBody = {
    location,
    checkin: checkIn,
    checkout: checkOut,
    adults: parseInt(adults),
    children: parseInt(children),
    rooms: parseInt(rooms),
    currency: 'USD',
    language: 'en'
  };

  // Fetch hotels from RateHawk API
  const { data: apiData, loading, error } = useApi(
    API_ENDPOINTS.HOTEL_SEARCH,
    {
      method: 'POST',
      body: apiBody,
      immediate: true, // Always fetch to show default results
      isRateHawkAPI: true,
      dependencies: [location, checkIn, checkOut, adults, children, rooms]
    }
  );

  // Transform Amadeus data to UI format or use fallback
  useEffect(() => {
    if (error || (!loading && !apiData) || !checkIn || !checkOut) {
      // Use fallback demo data
      setUseFallback(true);
      setHotels([
        {
          id: 1,
          name: 'Grand Plaza Hotel',
          location: location,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          rating: 4.8,
          reviews: 245,
          price: 120,
          amenities: ['Free WiFi', 'Breakfast', 'Pool', 'AC'],
          description: 'Luxury hotel with stunning views and excellent service'
        },
        {
          id: 2,
          name: 'Ocean View Resort',
          location: location,
          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
          rating: 4.6,
          reviews: 189,
          price: 95,
          amenities: ['Free WiFi', 'Beach Access', 'Restaurant', 'AC'],
          description: 'Beautiful beachfront property perfect for relaxation'
        },
        {
          id: 3,
          name: 'City Center Inn',
          location: location,
          image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop',
          rating: 4.5,
          reviews: 312,
          price: 80,
          amenities: ['Free WiFi', 'Parking', 'Breakfast', 'Gym'],
          description: 'Conveniently located in the heart of the city'
        },
        {
          id: 4,
          name: 'Mountain Lodge',
          location: location,
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
          rating: 4.9,
          reviews: 156,
          price: 150,
          amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Hiking'],
          description: 'Peaceful mountain retreat with breathtaking scenery'
        },
        {
          id: 5,
          name: 'Downtown Boutique Hotel',
          location: location,
          image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
          rating: 4.7,
          reviews: 203,
          price: 110,
          amenities: ['Free WiFi', 'Bar', 'Rooftop', 'AC'],
          description: 'Stylish boutique hotel with modern amenities'
        },
        {
          id: 6,
          name: 'Garden Suites',
          location: location,
          image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
          rating: 4.4,
          reviews: 178,
          price: 75,
          amenities: ['Free WiFi', 'Garden', 'Parking', 'Breakfast'],
          description: 'Tranquil garden setting with comfortable accommodations'
        }
      ]);

      // Show toast if API failed but we're using fallback
      if (error && checkIn && checkOut) {
        showToast('Using demo data. Please check your API credentials.', 'info');
      }
    } else if (apiData?.data) {
      // Transform Amadeus data to UI format
      setUseFallback(false);
      const transformedHotels = apiData.data.map((offer, index) => {
        const hotel = offer.hotel;
        const firstOffer = offer.offers?.[0];

        return {
          id: hotel.hotelId || index,
          name: hotel.name || 'Hotel',
          location: `${hotel.cityCode || location}`,
          image: `https://images.unsplash.com/photo-${1566073771259 + index}?w=400&h=300&fit=crop`, // Placeholder images
          rating: hotel.rating || 4.5,
          reviews: Math.floor(Math.random() * 300) + 50,
          price: firstOffer?.price?.total ? Math.round(parseFloat(firstOffer.price.total)) : 100,
          currency: firstOffer?.price?.currency || 'USD',
          amenities: ['Free WiFi', 'Breakfast', 'Pool', 'AC'], // Would need to parse from offer details
          description: firstOffer?.room?.description?.text || hotel.description || 'Comfortable accommodation with excellent facilities',
          offerId: firstOffer?.id,
          checkIn: firstOffer?.checkInDate,
          checkOut: firstOffer?.checkOutDate
        };
      });

      setHotels(transformedHotels);

      if (transformedHotels.length > 0) {
        showToast(`Found ${transformedHotels.length} hotels from Amadeus API`, 'success');
      }
    }
  }, [apiData, loading, error, location, checkIn, checkOut]);

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
        title={`Hotels in ${location} | TOOR - Find Your Perfect Stay`}
        description={`Find and book the best hotels in ${location}. Compare prices, read reviews, and get the best deals.`}
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

        {/* Results Section */}
        <div className="hotels-results-container">
          <div className="container">
            {/* API Status Banner */}
            {!loading && (
              <div style={{
                padding: '12px 20px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: useFallback ? '#fff3cd' : '#d1e7dd',
                border: `1px solid ${useFallback ? '#ffc107' : '#28a745'}`,
                color: '#000'
              }}>
                <strong>{useFallback ? '⚠️ Demo Mode' : '✓ Live Amadeus API'}</strong>
                <span style={{ marginLeft: '10px' }}>
                  {useFallback
                    ? 'Using demo data. Add check-in/out dates or verify API credentials to use live data.'
                    : `Showing real hotel data from Amadeus API for ${location}`
                  }
                </span>
              </div>
            )}

            {/* Results Header */}
            <div className="hotels-results-header">
              <div>
                <p className="hotels-breadcrumb">
                  Home › Hotels in {location}
                </p>
                <h1 className="hotels-title">
                  {loading ? 'Loading...' : `${hotels.length} Hotels Found`}
                  {checkIn && checkOut && (
                    <span className="hotels-dates">
                      {' '}for {formatDate(checkIn)} - {formatDate(checkOut)}
                    </span>
                  )}
                </h1>
                <p className="hotels-search-info">
                  {rooms} {rooms === '1' ? 'Room' : 'Rooms'} • {adults} {adults === '1' ? 'Adult' : 'Adults'}
                  {children !== '0' && ` • ${children} ${children === '1' ? 'Child' : 'Children'}`}
                </p>
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
                // Skeleton loaders
                [...Array(6)].map((_, i) => (
                  <div key={i} className="hotel-card skeleton">
                    <div className="hotel-card-image skeleton-image"></div>
                    <div className="hotel-card-content">
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text short"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Hotel cards
                hotels.map((hotel) => (
                  <div key={hotel.id} className="hotel-card">
                    <div className="hotel-card-image-wrapper">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="hotel-card-image"
                        loading="lazy"
                      />
                      <div className="hotel-card-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{hotel.rating}</span>
                      </div>
                      <div className="card-action-buttons">
                        <button
                          className={`card-action-button favorite-button ${
                            favorites.includes(hotel.id) ? 'active' : ''
                          }`}
                          onClick={() => toggleFavorite(hotel.id)}
                          aria-label="Add to favorites"
                        >
                          <Heart
                            size={20}
                            fill={favorites.includes(hotel.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          className="card-action-button share-button"
                          onClick={() => handleShare(hotel)}
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
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="hotel-amenity">
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
                          <span className="review-score">Excellent</span>
                          <span className="review-count">{hotel.reviews} reviews</span>
                        </div>
                        <div className="hotel-card-price-wrapper">
                          <div className="hotel-card-price">
                            <span className="price-label">From</span>
                            <span className="price-amount">
                              {hotel.currency && hotel.currency !== 'USD' ? hotel.currency : '$'}{hotel.price}
                            </span>
                            <span className="price-period">/night</span>
                          </div>
                          <Link to={`/property/${hotel.id}`} className="hotel-card-button">View Details</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && hotels.length === 0 && (
              <div className="no-results">
                <h3>No hotels found</h3>
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

export default Hotels;
