import React, { memo } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PropertyCard.css';

/**
 * Property Card Skeleton Loader
 */
export const PropertyCardSkeleton = memo(() => (
  <div className="property-card-skeleton">
    <div className="property-card-skeleton-layout">
      <div className="property-card-skeleton-image"></div>

      <div className="property-card-skeleton-content">
        <div className="property-card-skeleton-header">
          <div className="property-card-skeleton-info">
            <div className="property-card-skeleton-box property-card-skeleton-box-sm"></div>
            <div className="property-card-skeleton-box property-card-skeleton-box-md"></div>
            <div className="property-card-skeleton-box property-card-skeleton-box-xs"></div>
          </div>
        </div>

        <div className="property-card-skeleton-rating">
          <div className="property-card-skeleton-rating-badge"></div>
          <div className="property-card-skeleton-rating-text"></div>
        </div>

        <div className="property-card-skeleton-amenities"></div>

        <div className="property-card-skeleton-footer">
          <div className="property-card-skeleton-price">
            <div className="property-card-skeleton-price-label"></div>
            <div className="property-card-skeleton-price-value"></div>
          </div>
          <div className="property-card-skeleton-button"></div>
        </div>
      </div>
    </div>
  </div>
));

PropertyCardSkeleton.displayName = 'PropertyCardSkeleton';

const PropertyCard = memo(({ property }) => {
  const {
    id,
    name,
    location,
    rating,
    reviewCount,
    price,
    originalPrice,
    image,
    amenities = [],
    stars = 0,
    isFavorite = false,
  } = property;

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleCardClick = (e) => {
    // Only show toast if not clicking on the CTA button or favorite button
    if (!e.target.closest('.property-card-cta-button') && !e.target.closest('.property-card-favorite-button')) {
      toast.success('Viewing property...');
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success('Saved to favorites!');
  };

  return (
    <article className="property-card" onClick={handleCardClick}>
      <div className="property-card-layout">
        <div className="property-card-image-wrapper">
          <img
            src={image}
            alt={name}
            className="property-card-image"
          />

          <button
            className="property-card-favorite-button"
            aria-label="Add to favorites"
            onClick={handleFavoriteClick}
          >
            <Heart size={20} />
          </button>
        </div>

        <div className="property-card-content">
          <div className="property-card-header">
            <div className="property-card-info">
              <div className="property-card-location">
                <MapPin size={14} className="property-card-location-icon" />
                <span className="property-card-location-text">{location}</span>
              </div>

              <Link to={`/property/${id}`}>
                <h3 className="property-card-name">
                  {name}
                </h3>
              </Link>

              {stars > 0 && (
                <div className="property-card-stars">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} size={14} className="property-card-star-icon" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="property-card-rating">
            <div className="property-card-rating-badge">
              {rating}
            </div>
            <span className="property-card-rating-text">
              Very Good <span className="property-card-rating-count">{reviewCount} reviews</span>
            </span>
          </div>

          {amenities.length > 0 && (
            <div className="property-card-amenities">
              <span className="property-card-amenities-text">
                {amenities.join(' • ')}
              </span>
            </div>
          )}

          <div className="property-card-footer">
            <div className="property-card-price-section">
              <div className="property-card-price-label">
                Per Night for 4 Rooms
              </div>
              <div className="property-card-price-wrapper">
                <span className="property-card-price">
                  ${price}
                </span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="property-card-price-original">
                      ${originalPrice}
                    </span>
                    <span className="property-card-price-discount">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
              <div className="property-card-price-tax">excl. tax</div>
            </div>

            <Link
              to={`/property/${id}`}
              className="property-card-cta-button"
            >
              See availability
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
