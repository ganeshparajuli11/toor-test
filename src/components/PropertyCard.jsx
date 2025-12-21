import React, { memo, useState } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import OptimizedImage from './OptimizedImage';
import './PropertyCard.css';

/**
 * Property Card Skeleton Loader
 */
export const PropertyCardSkeleton = memo(() => (
  <div className="property-card-skeleton">
    <div className="property-card-skeleton-layout">
      <div className="property-card-skeleton-image skeleton-shimmer"></div>

      <div className="property-card-skeleton-content">
        <div className="property-card-skeleton-header">
          <div className="property-card-skeleton-info">
            <div className="property-card-skeleton-box property-card-skeleton-box-sm skeleton-shimmer"></div>
            <div className="property-card-skeleton-box property-card-skeleton-box-md skeleton-shimmer"></div>
            <div className="property-card-skeleton-box property-card-skeleton-box-xs skeleton-shimmer"></div>
          </div>
        </div>

        <div className="property-card-skeleton-rating">
          <div className="property-card-skeleton-rating-badge skeleton-shimmer"></div>
          <div className="property-card-skeleton-rating-text skeleton-shimmer"></div>
        </div>

        <div className="property-card-skeleton-amenities skeleton-shimmer"></div>

        <div className="property-card-skeleton-footer">
          <div className="property-card-skeleton-price">
            <div className="property-card-skeleton-price-label skeleton-shimmer"></div>
            <div className="property-card-skeleton-price-value skeleton-shimmer"></div>
          </div>
          <div className="property-card-skeleton-button skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  </div>
));

PropertyCardSkeleton.displayName = 'PropertyCardSkeleton';

const PropertyCard = memo(({ property, index = 0 }) => {
  const [isFavorited, setIsFavorited] = useState(false);

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
  } = property;

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleCardClick = (e) => {
    if (!e.target.closest('.property-card-cta-button') && !e.target.closest('.property-card-favorite-button')) {
      toast.success('Viewing property...');
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Saved to favorites!');
  };

  return (
    <article
      className="property-card appear-up"
      onClick={handleCardClick}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="property-card-layout">
        <div className="property-card-image-wrapper">
          <OptimizedImage
            src={image}
            alt={name}
            className="property-card-img"
            aspectRatio="4/3"
          />

          <button
            className={`property-card-favorite-button ${isFavorited ? 'active' : ''}`}
            aria-label="Add to favorites"
            onClick={handleFavoriteClick}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
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
              {rating >= 9 ? 'Exceptional' : rating >= 8 ? 'Excellent' : rating >= 7 ? 'Very Good' : 'Good'}
              <span className="property-card-rating-count"> {reviewCount} reviews</span>
            </span>
          </div>

          {amenities.length > 0 && (
            <div className="property-card-amenities">
              <span className="property-card-amenities-text">
                {amenities.slice(0, 4).join(' • ')}
              </span>
            </div>
          )}

          <div className="property-card-footer">
            <div className="property-card-price-section">
              <div className="property-card-price-label">
                Per Night
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
              className="property-card-cta-button btn-press"
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
