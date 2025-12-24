import { useState, useEffect, useCallback } from 'react';
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
import { useLanguage } from '../contexts/LanguageContext';
import './Hotels.css';


const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [initialHotels, setInitialHotels] = useState([]); // Real hotels shown before search
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Loading state for initial hotels
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  const { userLocation } = useLocation();
  const { currency, formatCurrency } = useLanguage();

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

  // Only create selectedLocation when there's an actual URL dest_id from a search
  // User location from context should NOT be used as dest_id (city name is not a valid region ID)
  const selectedLocation = urlDestId ? {
    dest_id: urlDestId,
    search_type: urlSearchType,
    label: urlLocation,
    name: urlLocation.split(',')[0]
  } : null;

  const currentLocation = selectedLocation?.name || selectedLocation?.label || '';
  // hasSearchParams should only be true when user has performed an actual search (has dest_id in URL)
  const hasSearchParams = !!urlDestId;

  // Fetch suggested hotels when page loads using multicomplete API
  // This is faster and returns hotels with actual names from the API
  const fetchInitialHotels = useCallback(async (searchQuery) => {
    setInitialLoading(true);
    try {
      console.log(`[Hotels Page] Fetching suggested hotels for: ${searchQuery}`);

      // Use the new getSuggestedHotels method which uses multicomplete API
      // It automatically tries fallback queries if the first one returns no results
      const suggestedHotels = await ratehawkService.getSuggestedHotels(searchQuery);

      if (suggestedHotels && suggestedHotels.length > 0) {
        // Hotels come pre-formatted from the backend with actual names
        setInitialHotels(suggestedHotels);
        console.log(`[Hotels Page] Loaded ${suggestedHotels.length} suggested hotels:`, suggestedHotels.map(h => h.name));
      } else {
        console.log('[Hotels Page] No suggested hotels found from API');
        setInitialHotels([]);
      }
    } catch (err) {
      console.error('[Hotels Page] Error fetching suggested hotels:', err);
      setInitialHotels([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Load initial/recommended hotels on page load
  useEffect(() => {
    if (!hasSearchParams) {
      // Use user's location city if available, otherwise use 'hotel' as generic search
      const searchQuery = userLocation?.city || 'hotel';
      fetchInitialHotels(searchQuery);
    }
  }, [hasSearchParams, userLocation?.city, fetchInitialHotels]);

  // Fetch hotels from RateHawk API when user searches
  // Using useCallback to avoid stale closures and ensure we use latest URL params
  const fetchHotels = useCallback(async () => {
    // Read directly from URL params to avoid stale closure issues
    const destId = searchParams.get('dest_id');
    const locationName = searchParams.get('location') || '';
    const checkInDate = searchParams.get('checkIn') || getDefaultCheckIn();
    const checkOutDate = searchParams.get('checkOut') || getDefaultCheckOut();
    const adultsCount = searchParams.get('adults') || 2;
    const roomsCount = searchParams.get('rooms') || 1;

    if (!destId) {
      console.log('[Hotels] No dest_id in URL, skipping search');
      return;
    }

    console.log('[Hotels] Starting search with params:', { destId, locationName, checkInDate, checkOutDate });

    setLoading(true);
    setError(null);
    setUseFallback(false);
    setSearchProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const params = {
        destination: destId,
        checkIn: checkInDate.split('T')[0],
        checkOut: checkOutDate.split('T')[0],
        guests: parseInt(adultsCount),
        rooms: parseInt(roomsCount),
        currency: currency
      };

      console.log('[Hotels] Calling searchHotels with:', params);
      const results = await ratehawkService.searchHotels(params);
      setSearchProgress(100);

      console.log('[Hotels] API Response:', results);
      if (results && results.length > 0) {
        console.log('[Hotels] Hotels received:', results.map(h => ({
          id: h.id,
          name: h.name,
          image: h.image,
          imagesCount: h.images?.length || 0
        })));
        setHotels(results);
        const displayLocation = locationName.split(',')[0] || 'selected area';
        showToast(`Found ${results.length} hotels in ${displayLocation}!`, 'success');
      } else {
        setHotels([]);
        showToast('No hotels found for these dates. Try different dates.', 'info');
      }
    } catch (err) {
      console.error('[Hotels] Error fetching hotels:', err);

      // Handle specific API errors based on api.md documentation
      let errorMessage = 'An error occurred while searching for hotels.';

      if (err.message?.includes('invalid_params')) {
        errorMessage = 'Invalid search parameters. Please check your dates and try again.';
      } else if (err.message?.includes('checkin date must be current or future')) {
        errorMessage = 'Check-in date must be today or a future date.';
      } else if (err.message?.includes('checkout date must be after checkin')) {
        errorMessage = 'Check-out date must be after check-in date.';
      } else if (err.message?.includes('region_id')) {
        errorMessage = 'Invalid location selected. Please search for a different destination.';
      } else if (err.message?.includes('hotels_not_found')) {
        errorMessage = 'No hotels found for this location. Try a different destination.';
      } else if (err.message?.includes('core_search_error')) {
        errorMessage = 'Search service is temporarily unavailable. Please try again later.';
      } else if (err.message?.includes('credentials') || err.message?.includes('401')) {
        errorMessage = 'API credentials issue. Please check your RateHawk configuration.';
      }

      setError(errorMessage);
      setUseFallback(true);
      loadFallbackData();
      showToast(errorMessage, 'warning');
    } finally {
      clearInterval(progressInterval);
      setSearchProgress(100);
      setTimeout(() => setLoading(false), 300);
    }
  }, [searchParams]);

  // Trigger search when URL params change
  useEffect(() => {
    const destId = searchParams.get('dest_id');
    const checkInDate = searchParams.get('checkIn');
    const checkOutDate = searchParams.get('checkOut');

    // Only fetch when user has actually searched (has dest_id in URL)
    if (destId && checkInDate && checkOutDate) {
      console.log('[Hotels] URL params detected, triggering search');
      fetchHotels();
    }
  }, [searchParams, fetchHotels]);

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
        title={`Hotels in ${currentLocation} | Zanafly - Find Your Perfect Stay`}
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
            {/* API Status Banner - Only show in development for debugging */}
            {import.meta.env.DEV && !loading && hasSearchParams && useFallback && (
              <div className={`hotels-status-banner warning fade-in`}>
                <strong>Demo Mode</strong>
                <span>Using demo data. Configure RateHawk API keys in Admin Settings.</span>
              </div>
            )}

            {/* Results Header */}
            <div className="hotels-results-header fade-in">
              <div>
                <p className="hotels-breadcrumb">
                  Home &rsaquo; Hotels{hasSearchParams ? ` in ${currentLocation}` : ''}
                </p>
                <h1 className="hotels-title">
                  {loading ? (
                    <span className="loading-text">
                      <Loader2 className="spinner" size={24} />
                      Searching hotels...
                    </span>
                  ) : initialLoading && !hasSearchParams ? (
                    <span className="loading-text">
                      <Loader2 className="spinner" size={24} />
                      Loading recommended hotels...
                    </span>
                  ) : hasSearchParams ? (
                    `${hotels.length} Hotels Found in ${currentLocation}`
                  ) : initialHotels.length > 0 ? (
                    'Recommended Hotels'
                  ) : (
                    'Search for Hotels'
                  )}
                  {hasSearchParams && checkIn && checkOut && !loading && (
                    <span className="hotels-dates">
                      {' '}for {formatDate(checkIn)} - {formatDate(checkOut)}
                    </span>
                  )}
                </h1>
                {hasSearchParams && (
                  <p className="hotels-search-info">
                    {rooms} {rooms === '1' ? 'Room' : 'Rooms'} &bull; {adults} {adults === '1' ? 'Adult' : 'Adults'}
                    {children !== '0' && ` &bull; ${children} ${children === '1' ? 'Child' : 'Children'}`}
                  </p>
                )}
                {!hasSearchParams && !initialLoading && initialHotels.length === 0 && (
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
              {(loading || (initialLoading && !hasSearchParams)) ? (
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
              ) : hasSearchParams && hotels.length > 0 ? (
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
                        <span>{typeof hotel.rating === 'number' ? hotel.rating.toFixed(1) : hotel.rating}</span>
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
                        <div className="hotel-card-price">
                          <span className="price-label">From</span>
                          <span className="price-amount">
                            {formatCurrency(hotel.price || 0, hotel.currency || currency)}
                          </span>
                          <span className="price-period">/night</span>
                        </div>
                        <Link
                          to={`/property/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}&price=${hotel.price || 0}&currency=${hotel.currency || currency}`}
                          className="hotel-card-button"
                          onClick={() => {
                            // Store hotel data in sessionStorage for quick access on details page
                            sessionStorage.setItem(`hotel_${hotel.id}`, JSON.stringify({
                              id: hotel.id,
                              name: hotel.name,
                              location: hotel.location,
                              rating: hotel.rating,
                              reviewScore: hotel.reviewScore,
                              reviewCount: hotel.reviews,
                              price: hotel.price,
                              images: hotel.images || [hotel.image],
                              amenities: hotel.amenities,
                              description: hotel.description
                            }));
                          }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : !hasSearchParams && initialHotels.length > 0 ? (
                // Initial/Recommended hotels (before user searches)
                initialHotels.map((hotel, index) => (
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
                        <span>{typeof hotel.rating === 'number' ? hotel.rating.toFixed(1) : hotel.rating}</span>
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
                        <div className="hotel-card-price">
                          <span className="price-label">From</span>
                          <span className="price-amount">
                            {formatCurrency(hotel.price || 0, hotel.currency || currency)}
                          </span>
                          <span className="price-period">/night</span>
                        </div>
                        <Link
                          to={`/property/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}&price=${hotel.price || 0}&currency=${hotel.currency || currency}`}
                          className="hotel-card-button"
                          onClick={() => {
                            // Store hotel data in sessionStorage for quick access on details page
                            sessionStorage.setItem(`hotel_${hotel.id}`, JSON.stringify({
                              id: hotel.id,
                              name: hotel.name,
                              location: hotel.location,
                              rating: hotel.rating,
                              reviewScore: hotel.reviewScore,
                              reviewCount: hotel.reviews,
                              price: hotel.price,
                              images: hotel.images || [hotel.image],
                              amenities: hotel.amenities,
                              description: hotel.description
                            }));
                          }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : hasSearchParams && hotels.length === 0 ? (
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
