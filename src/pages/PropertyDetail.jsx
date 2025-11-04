import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Heart, Share2, Award, Tag } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ImageGallery from '../components/ImageGallery';
import AmenitiesList from '../components/AmenitiesList';
import ReviewsSection from '../components/ReviewsSection';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import './PropertyDetail.css';

/**
 * Property Detail Page
 * Displays complete information about a property
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const url = getApiUrl(API_ENDPOINTS.PROPERTY_DETAILS, { id });
        const response = await axios.get(url);
        setProperty(response.data.data || response.data);
      } catch (error) {
        console.warn('API Error, using fallback data:', error.message);
        setProperty(fallbackProperty);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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
        title={`${propertyData.name} - $${propertyData.price}/night | TOUR`}
        description={propertyData.description[0]}
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
                <div className="property-rating">
                  <div className="property-rating-badge">
                    {propertyData.rating}
                  </div>
                  <span className="property-rating-text">
                    Very Good <span className="property-rating-count">({propertyData.reviewCount} reviews)</span>
                  </span>
                </div>
              </div>

              <div className="property-actions">
                <div className="property-price-container">
                  <div className="property-price">
                    ${propertyData.price}
                    <span className="property-price-unit">/night</span>
                  </div>
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
                    to={`/booking/${id}`}
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
                {/* Description */}
                <div className="property-description">
                  <div className="property-description-text">
                    {propertyData.description.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="property-tags">
                    {propertyData.tags.map((tag, index) => (
                      <div key={index} className="property-tag">
                        {index === 0 ? <Award size={16} /> : <Tag size={16} />}
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <AmenitiesList amenities={propertyData.amenities} />

                {/* Reviews */}
                <ReviewsSection
                  overallRating={propertyData.overallRating}
                  totalReviews={propertyData.totalReviews}
                  ratingBreakdown={propertyData.ratingBreakdown}
                />

                {/* Location/Map */}
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
              </>
            )}

            {activeTab === 'rooms' && (
              <div className="property-rooms">
                <h2 className="property-rooms-title">Available Rooms</h2>
                <p className="property-rooms-text">
                  Room information will be displayed here. Connect your backend API to show available rooms.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection
                overallRating={propertyData.overallRating}
                totalReviews={propertyData.totalReviews}
                ratingBreakdown={propertyData.ratingBreakdown}
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
