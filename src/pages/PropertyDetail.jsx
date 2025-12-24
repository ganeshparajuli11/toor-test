import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { MapPin, Heart, Share2, Award, Tag, Users, Coffee, X, Check, Calendar, Loader2, Clock, Phone, Mail, Star, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ImageGallery from '../components/ImageGallery';
import AmenitiesList from '../components/AmenitiesList';
import ReviewsSection from '../components/ReviewsSection';
import ratehawkService from '../services/ratehawk.service';
import { useLanguage } from '../contexts/LanguageContext';
import './PropertyDetail.css';

/**
 * Property Detail Page
 * Displays complete information about a property
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Get currency from context
  const { currency, formatCurrency } = useLanguage();

  // Get search params passed from Hotels page
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;
  const rooms = searchParams.get('rooms') || 1;
  const priceFromSearch = searchParams.get('price');

  // Fallback property data
  const fallbackProperty = {
    id: 1,
    name: 'Whispering Pines Cottages|Treehouse|Tandi',
    location: '4624, Himachal Pradesh, India',
    rating: 4.2,
    reviewCount: 171,
    price: 240,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    ],
    description: [
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
    ],
    tags: ['Business Services', 'Top rated in area'],
    amenities: [
      'Free wifi',
      'Indoor pool',
      'Restaurant',
      'Room service',
      'Parking available',
      'Air Conditioning',
      'Fitness center',
      'Bar/Lounge',
      'Tea/Coffee machine',
      'Business Services',
    ],
    overallRating: 4.2,
    totalReviews: 171,
    ratingBreakdown: {
      'Staff/service': 4.5,
      'Location': 4.2,
      'Amenities': 4.3,
      'Hospitality': 4.4,
      'Food': 4.5,
    },
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387191.0360!2d-74.25987!3d40.697670!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s',
  };

  // Fetch property data from RateHawk
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);

      // First, check if we have cached data from Hotels page
      let cachedData = null;
      // Helper function to process image URLs
      const processImageUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        let processed = url;
        // Decode URL-encoded placeholders
        processed = processed.replace(/%7Bsize%7D/gi, '1024x768');
        processed = processed.replace(/%7B/g, '{').replace(/%7D/g, '}');
        // Replace {size} placeholders
        processed = processed.replace(/t\/\{size\}\//gi, 't/1024x768/');
        processed = processed.replace(/\/\{size\}\//gi, '/1024x768/');
        processed = processed.replace(/t\{size\}/gi, '1024x768');
        processed = processed.replace(/_\{size\}_/gi, '_1024x768_');
        processed = processed.replace(/\{size\}/gi, '1024x768');
        // Ensure HTTPS
        if (processed.startsWith('http://')) {
          processed = processed.replace('http://', 'https://');
        }
        if (processed.startsWith('//')) {
          processed = 'https:' + processed;
        }
        return processed;
      };

      try {
        const cached = sessionStorage.getItem(`hotel_${id}`);
        if (cached) {
          cachedData = JSON.parse(cached);
          console.log('[PropertyDetail] Using cached hotel data:', cachedData);
          // Process cached images
          if (cachedData.images && cachedData.images.length > 0) {
            cachedData.images = cachedData.images.map(processImageUrl).filter(Boolean);
            console.log('[PropertyDetail] Processed cached images:', cachedData.images);
          }
          // Set cached data immediately for instant display
          if (cachedData.images && cachedData.images.length > 0) {
            const initialProperty = {
              ...fallbackProperty,
              ...cachedData,
              images: cachedData.images,
            };
            if (priceFromSearch && parseFloat(priceFromSearch) > 0) {
              initialProperty.price = parseFloat(priceFromSearch);
            }
            setProperty(initialProperty);
          }
        }
      } catch (e) {
        console.log('[PropertyDetail] No cached data found');
      }

      try {
        const hotelData = await ratehawkService.getHotelDetails(id);
        console.log('Hotel details from API:', hotelData);
        console.log('[PropertyDetail] API images:', hotelData.images);

        // Use price from search params if available (since hotel/info doesn't return price)
        if (priceFromSearch && parseFloat(priceFromSearch) > 0) {
          hotelData.price = parseFloat(priceFromSearch);
        }

        // Prefer cached images if they have more images than API response
        // This is because the search API may return more images than the hotel/info API
        const apiImageCount = hotelData.images?.length || 0;
        const cachedImageCount = cachedData?.images?.length || 0;

        if (cachedImageCount > apiImageCount) {
          console.log(`[PropertyDetail] Using cached images (${cachedImageCount}) over API images (${apiImageCount})`);
          hotelData.images = cachedData.images;
        } else if (apiImageCount === 0 && cachedImageCount > 0) {
          console.log('[PropertyDetail] API returned no images, using cached images');
          hotelData.images = cachedData.images;
        }

        // Process all images to ensure {size} placeholders are replaced
        if (hotelData.images && Array.isArray(hotelData.images)) {
          hotelData.images = hotelData.images.map(processImageUrl).filter(Boolean);
          console.log('[PropertyDetail] Processed images:', hotelData.images);
        }

        setProperty(hotelData);
      } catch (error) {
        console.warn('API Error, using fallback data:', error.message);
        // Include price in fallback if available from search
        const fallbackWithPrice = cachedData ? { ...fallbackProperty, ...cachedData } : { ...fallbackProperty };
        if (priceFromSearch && parseFloat(priceFromSearch) > 0) {
          fallbackWithPrice.price = parseFloat(priceFromSearch);
        }
        setProperty(fallbackWithPrice);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, priceFromSearch]);

  // Fetch reviews when property is loaded
  useEffect(() => {
    const fetchReviews = async () => {
      if (!property) return;

      setReviewsLoading(true);
      try {
        console.log('[PropertyDetail] Fetching reviews for:', id);
        const reviewsData = await ratehawkService.getHotelReviews(id);
        console.log('[PropertyDetail] Reviews received:', reviewsData);

        if (reviewsData.reviews && reviewsData.reviews.length > 0) {
          // Transform reviews to match component format
          const formattedReviews = reviewsData.reviews.map((review, index) => ({
            id: review.id || index,
            rating: review.rating || review.score || 5.0,
            title: review.title || getRatingLabel(review.rating || review.score || 5.0),
            text: review.text || review.comment || review.review_text || '',
            userName: review.author || review.user_name || review.guest_name || 'Guest',
            userAvatar: review.avatar || null,
            date: review.date || review.created_at || new Date().toISOString(),
            pros: review.pros || null,
            cons: review.cons || null,
          }));
          setReviews(formattedReviews);
        }
      } catch (error) {
        console.error('[PropertyDetail] Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [property, id]);

  // Helper function to get rating label
  const getRatingLabel = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 8) return 'Very Good';
    if (rating >= 7) return 'Good';
    if (rating >= 6) return 'Fair';
    return 'Average';
  };

  // Fetch rates when property is loaded and we have dates
  useEffect(() => {
    const fetchRates = async () => {
      if (!property || !checkIn || !checkOut) {
        return;
      }

      setRatesLoading(true);
      setRatesError(null);

      try {
        console.log('[PropertyDetail] Fetching rates for:', id, { checkIn, checkOut, adults, rooms, currency });
        const hotelRates = await ratehawkService.getHotelRates(id, {
          checkIn,
          checkOut,
          adults: parseInt(adults),
          rooms: parseInt(rooms),
          currency: currency
        });

        console.log('[PropertyDetail] Rates received:', hotelRates);
        setRates(hotelRates);
      } catch (error) {
        console.error('[PropertyDetail] Error fetching rates:', error);
        setRatesError(error.message || 'Unable to fetch room rates');
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [property, id, checkIn, checkOut, adults, rooms, currency]);

  // Helper function to format cancellation date
  const formatCancellationDate = (dateString) => {
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

  // Helper to calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  // Loading skeleton
  if (loading && !property) {
    return (
      <div className="property-detail-loading">
        <Header />
        <div className="property-detail-skeleton">
          <div className="skeleton-grid skeleton-animate">
            <div className="skeleton-item skeleton-gallery" />
            <div className="skeleton-item skeleton-header" />
            <div className="skeleton-item skeleton-content" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const propertyData = property || fallbackProperty;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={`${propertyData.name} - ${propertyData.price ? `$${propertyData.price}/night` : ''} | Zanafly`}
        description={Array.isArray(propertyData.description) ? propertyData.description[0] : propertyData.description}
        keywords={`${propertyData.name}, hotel booking, ${propertyData.location}`}
        canonical={`/property/${id}`}
      />

      <div className="property-detail-page">
        {/* Header Component */}
        <Header />

        {/* Main Content */}
        <div className="property-detail-container">
          {/* Property Header */}
          <div className="property-header">
            <div className="property-header-content">
              <div className="property-header-info">
                <h1 className="property-title">
                  {propertyData.name}
                </h1>
                <div className="property-location">
                  <MapPin size={18} className="property-location-icon" />
                  <span>{propertyData.location}</span>
                </div>
                {/* Star Rating */}
                {propertyData.rating > 0 && (
                  <div className="property-star-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < propertyData.rating ? '#f59e0b' : 'none'}
                        stroke={i < propertyData.rating ? '#f59e0b' : '#d1d5db'}
                      />
                    ))}
                    <span className="star-rating-text">{propertyData.rating}-star {propertyData.propertyType || 'Hotel'}</span>
                  </div>
                )}
                {/* Review Score */}
                {propertyData.reviewScore > 0 && (
                  <div className="property-rating">
                    <div className="property-rating-badge">
                      {propertyData.reviewScore}
                    </div>
                    <span className="property-rating-text">
                      {propertyData.reviewScore >= 9 ? 'Excellent' : propertyData.reviewScore >= 8 ? 'Very Good' : propertyData.reviewScore >= 7 ? 'Good' : 'Fair'}
                      {propertyData.reviewCount > 0 && (
                        <span className="property-rating-count"> ({propertyData.reviewCount} reviews)</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="property-actions">
                <div className="property-price-container">
                  <div className="property-price">
                    {propertyData.price > 0 ? `$${propertyData.price}` : 'Price on request'}
                    {propertyData.price > 0 && <span className="property-price-unit">/night</span>}
                  </div>
                  {checkIn && checkOut && (
                    <div className="property-dates-info" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="property-action-buttons">
                  <button
                    className="property-icon-button"
                    aria-label="Add to favorites"
                    onClick={() => toast.success('Added to favorites!')}
                  >
                    <Heart size={20} />
                  </button>
                  <button
                    className="property-icon-button"
                    aria-label="Share property"
                    onClick={() => toast.success('Link copied to clipboard!')}
                  >
                    <Share2 size={20} />
                  </button>
                  <Link
                    to={`/property/${id}/book?checkIn=${checkIn || ''}&checkOut=${checkOut || ''}&adults=${adults}&children=${children}&rooms=${rooms}&price=${propertyData.price || 0}&name=${encodeURIComponent(propertyData.name)}&location=${encodeURIComponent(propertyData.location)}`}
                    className="property-book-button"
                    onClick={() => toast.success('Redirecting to booking...')}
                  >
                    Book now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="property-gallery">
            <ImageGallery images={propertyData.images} propertyName={propertyData.name} />
          </div>

          {/* Tabs */}
          <div className="property-tabs">
            <div className="property-tabs-list">
              <button
                onClick={() => setActiveTab('overview')}
                className={`property-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`property-tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
              >
                Rooms
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`property-tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              >
                Guest Reviews
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="property-tab-content">
            {activeTab === 'overview' && (
              <>
                {/* Key Info Cards */}
                <div className="property-info-cards">
                  {/* Check-in/out Times */}
                  {(propertyData.checkInTime || propertyData.checkOutTime) && (
                    <div className="info-card">
                      <div className="info-card-header">
                        <Clock size={20} />
                        <h3>Check-in / Check-out</h3>
                      </div>
                      <div className="info-card-body">
                        {propertyData.checkInTime && (
                          <div className="info-row">
                            <span className="info-label">Check-in:</span>
                            <span className="info-value">From {propertyData.checkInTime}</span>
                          </div>
                        )}
                        {propertyData.checkOutTime && (
                          <div className="info-row">
                            <span className="info-label">Check-out:</span>
                            <span className="info-value">Until {propertyData.checkOutTime}</span>
                          </div>
                        )}
                        {propertyData.frontDeskStart && propertyData.frontDeskEnd && (
                          <div className="info-row">
                            <span className="info-label">Front desk:</span>
                            <span className="info-value">
                              {propertyData.frontDeskStart === '00:00' && propertyData.frontDeskEnd === '00:00'
                                ? '24 hours'
                                : `${propertyData.frontDeskStart} - ${propertyData.frontDeskEnd}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {(propertyData.phone || propertyData.email) && (
                    <div className="info-card">
                      <div className="info-card-header">
                        <Phone size={20} />
                        <h3>Contact</h3>
                      </div>
                      <div className="info-card-body">
                        {propertyData.phone && (
                          <div className="info-row">
                            <Phone size={16} />
                            <a href={`tel:${propertyData.phone}`} className="info-link">{propertyData.phone}</a>
                          </div>
                        )}
                        {propertyData.email && (
                          <div className="info-row">
                            <Mail size={16} />
                            <a href={`mailto:${propertyData.email}`} className="info-link">{propertyData.email}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="property-description">
                  <div className="property-description-text">
                    {(Array.isArray(propertyData.description) ? propertyData.description : [propertyData.description]).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Tags */}
                  {propertyData.tags && propertyData.tags.length > 0 && (
                    <div className="property-tags">
                      {propertyData.tags.map((tag, index) => (
                        <div key={index} className="property-tag">
                          {index === 0 ? <Award size={16} /> : <Tag size={16} />}
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <AmenitiesList amenities={propertyData.amenities} />

                {/* Rooms Preview (if rates available) */}
                {rates.length > 0 && (
                  <div className="property-rooms-preview">
                    <div className="rooms-preview-header">
                      <h2>Available Rooms</h2>
                      <button
                        className="rooms-preview-view-all"
                        onClick={() => setActiveTab('rooms')}
                      >
                        View all {rates.length} rooms
                      </button>
                    </div>
                    <div className="rooms-preview-list">
                      {rates.slice(0, 3).map((rate, index) => (
                        <div key={rate.match_hash || index} className="rooms-preview-item">
                          <div className="rooms-preview-info">
                            <h4>{rate.room_name || 'Standard Room'}</h4>
                            <div className="rooms-preview-details">
                              {rate.room_data?.bedding_type && (
                                <span className="preview-detail">
                                  <BedDouble size={14} /> {rate.room_data.bedding_type}
                                </span>
                              )}
                              <span className={`preview-meal ${rate.meal === 'Breakfast included' ? 'included' : ''}`}>
                                <Coffee size={14} /> {rate.meal}
                              </span>
                              {rate.cancellation?.free_cancellation_before && (
                                <span className="preview-cancellation">
                                  <Check size={14} /> Free cancellation
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="rooms-preview-price">
                            <span className="preview-price-value">
                              ${parseFloat(rate.total_price).toFixed(0)}
                            </span>
                            <span className="preview-price-nights">
                              {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <ReviewsSection
                  overallRating={propertyData.reviewScore || propertyData.overallRating}
                  totalReviews={propertyData.reviewCount || propertyData.totalReviews}
                  ratingBreakdown={propertyData.ratingBreakdown}
                  reviews={reviews}
                  loading={reviewsLoading}
                />

                {/* Location/Map */}
                {propertyData.mapEmbedUrl && (
                  <div className="property-location-section">
                    <h2 className="property-location-title">Location/Map</h2>
                    <div className="property-map">
                      <iframe
                        src={propertyData.mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Property location map"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'rooms' && (
              <div className="property-rooms">
                <h2 className="property-rooms-title">Available Rooms</h2>

                {/* Search Info */}
                {checkIn && checkOut && (
                  <div className="property-search-summary">
                    <Calendar size={18} />
                    <span>
                      {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                      {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' '}({calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'})
                    </span>
                    <span className="search-guests">
                      <Users size={16} /> {adults} {adults === '1' ? 'Adult' : 'Adults'}, {rooms} {rooms === '1' ? 'Room' : 'Rooms'}
                    </span>
                  </div>
                )}

                {/* Loading State */}
                {ratesLoading && (
                  <div className="rates-loading">
                    <Loader2 className="spinner" size={24} />
                    <span>Loading available rooms...</span>
                  </div>
                )}

                {/* Room Groups from Hotel Info (shown when rates not available) */}
                {propertyData.roomGroups && propertyData.roomGroups.length > 0 && (
                  <>
                    {/* Show info message if rates failed or no dates */}
                    {(ratesError || !checkIn || !checkOut || (!ratesLoading && rates.length === 0)) && (
                      <div className="room-groups-info">
                        <BedDouble size={20} />
                        <span>
                          {!checkIn || !checkOut
                            ? 'Room types available at this property. Select dates for pricing.'
                            : 'Live pricing unavailable. Here are the room types at this property.'}
                        </span>
                      </div>
                    )}

                    {/* Room Groups List */}
                    {(ratesError || !checkIn || !checkOut || (!ratesLoading && rates.length === 0)) && (
                      <div className="room-groups-list">
                        {propertyData.roomGroups.map((room, index) => (
                          <div key={index} className="room-group-card">
                            {/* Room Image */}
                            {room.images && room.images.length > 0 && (
                              <div className="room-group-image">
                                <img src={room.images[0]} alt={room.name} />
                              </div>
                            )}

                            <div className="room-group-content">
                              <h3 className="room-group-name">{room.name}</h3>

                              {/* Room Details */}
                              <div className="room-group-details">
                                {room.bedding_type && (
                                  <div className="room-group-detail">
                                    <BedDouble size={16} />
                                    <span>{room.bedding_type}</span>
                                  </div>
                                )}
                                {room.size && (
                                  <div className="room-group-detail">
                                    <span>{room.size} m²</span>
                                  </div>
                                )}
                                {room.bathroom && (
                                  <div className="room-group-detail">
                                    <span>{room.bathroom}</span>
                                  </div>
                                )}
                              </div>

                              {/* Room Amenities */}
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="room-group-amenities">
                                  {room.amenities.slice(0, 6).map((amenity, i) => (
                                    <span key={i} className="room-amenity-tag">{amenity}</span>
                                  ))}
                                  {room.amenities.length > 6 && (
                                    <span className="room-amenity-more">+{room.amenities.length - 6} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* No Room Groups and No Dates */}
                {(!propertyData.roomGroups || propertyData.roomGroups.length === 0) && (!checkIn || !checkOut) && (
                  <div className="rates-no-dates">
                    <Calendar size={32} />
                    <p>Select check-in and check-out dates to see available rooms and prices.</p>
                  </div>
                )}

                {/* Rates List (when available) */}
                {!ratesLoading && !ratesError && rates.length > 0 && (
                  <div className="rates-list">
                    {rates.map((rate, index) => (
                      <div key={rate.match_hash || index} className="rate-card">
                        <div className="rate-card-header">
                          <h3 className="rate-room-name">{rate.room_name || 'Standard Room'}</h3>
                          {rate.room_data?.main_room_type && (
                            <span className="rate-room-type">{rate.room_data.main_room_type}</span>
                          )}
                        </div>

                        <div className="rate-card-body">
                          {/* Room Details */}
                          <div className="rate-details">
                            {/* Meal Info */}
                            <div className="rate-detail-item">
                              <Coffee size={16} />
                              <span className={rate.meal === 'Breakfast included' ? 'meal-included' : 'meal-not-included'}>
                                {rate.meal}
                              </span>
                            </div>

                            {/* Bed Type */}
                            {rate.room_data?.bedding_type && (
                              <div className="rate-detail-item">
                                <span className="bed-type">{rate.room_data.bedding_type}</span>
                              </div>
                            )}

                            {/* Occupancy */}
                            <div className="rate-detail-item">
                              <Users size={16} />
                              <span>{rate.allotment || 1} {rate.allotment === 1 ? 'room' : 'rooms'} left</span>
                            </div>

                            {/* Amenities */}
                            {rate.amenities && rate.amenities.length > 0 && (
                              <div className="rate-amenities">
                                {rate.amenities.map((amenity, i) => (
                                  <span key={i} className="rate-amenity-tag">
                                    {amenity.replace(/-/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Cancellation Policy */}
                          <div className="rate-cancellation">
                            {rate.cancellation?.free_cancellation_before ? (
                              <div className="cancellation-free">
                                <Check size={16} className="icon-green" />
                                <span>
                                  Free cancellation before {formatCancellationDate(rate.cancellation.free_cancellation_before)}
                                </span>
                              </div>
                            ) : (
                              <div className="cancellation-non-refundable">
                                <X size={16} className="icon-red" />
                                <span>Non-refundable</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rate-card-footer">
                          {/* Daily Prices */}
                          {rate.daily_prices && rate.daily_prices.length > 0 && (
                            <div className="rate-daily-prices">
                              <span className="daily-price-label">Per night:</span>
                              <span className="daily-price-value">
                                {formatCurrency(parseFloat(rate.daily_prices[0]).toFixed(0), rate.currency || currency)}
                              </span>
                            </div>
                          )}

                          {/* Total Price */}
                          <div className="rate-total-price">
                            <span className="total-price-label">Total for {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}</span>
                            <span className="total-price-value">
                              {formatCurrency(parseFloat(rate.total_price).toFixed(0), rate.currency || currency)}
                            </span>
                          </div>

                          {/* Book Button */}
                          <Link
                            to={`/property/${id}/book?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}&price=${rate.total_price}&currency=${rate.currency || currency}&name=${encodeURIComponent(propertyData.name)}&location=${encodeURIComponent(propertyData.location)}&roomName=${encodeURIComponent(rate.room_name || 'Standard Room')}&matchHash=${rate.match_hash || ''}`}
                            className="rate-book-button"
                          >
                            Book This Room
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection
                overallRating={propertyData.reviewScore || propertyData.overallRating}
                totalReviews={propertyData.reviewCount || propertyData.totalReviews}
                ratingBreakdown={propertyData.ratingBreakdown}
                reviews={reviews}
                loading={reviewsLoading}
              />
            )}
          </div>
        </div>

        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default PropertyDetail;
