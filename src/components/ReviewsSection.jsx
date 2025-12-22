import React, { memo, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Flag, ThumbsUp, ThumbsDown, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import './ReviewsSection.css';

/**
 * Get rating text based on score
 */
const getRatingText = (rating) => {
  if (rating >= 9) return 'Excellent';
  if (rating >= 8) return 'Very Good';
  if (rating >= 7) return 'Good';
  if (rating >= 6) return 'Fair';
  if (rating >= 5) return 'Average';
  return 'Below Average';
};

/**
 * Format date for display
 */
const formatReviewDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Review Card Component
 */
const ReviewCard = memo(({ review }) => {
  const { rating, title, text, userName, userAvatar, date, pros, cons, travelType, travellerType, roomType, nights, guests } = review;

  return (
    <div className="review-card">
      <div className="review-content">
        {/* User Avatar */}
        <div className="review-avatar">
          <div className="review-avatar-image">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
              />
            ) : (
              <div className="review-avatar-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Review Body */}
        <div className="review-body">
          <div className="review-header">
            <div className="review-header-left">
              <div className="review-rating-container">
                <div className="review-rating-badge">
                  {typeof rating === 'number' ? rating.toFixed(1) : rating}
                </div>
                <span className="review-rating-text">{getRatingText(rating)}</span>
              </div>
              <div className="review-user-info">
                <p className="review-user-name">{userName}</p>
                {date && <span className="review-date">{formatReviewDate(date)}</span>}
              </div>
            </div>
            <button
              className="review-report-button"
              aria-label="Report review"
              onClick={() => toast.info('Reporting review...')}
            >
              <Flag size={18} />
            </button>
          </div>

          {/* Travel Info Tags */}
          {(travelType || travellerType || nights || guests) && (
            <div className="review-travel-info">
              {travellerType && <span className="review-tag">{travellerType}</span>}
              {travelType && <span className="review-tag">{travelType}</span>}
              {nights && <span className="review-tag">{nights} nights</span>}
              {guests && <span className="review-tag">{guests}</span>}
            </div>
          )}

          {/* Room Type */}
          {roomType && <p className="review-room-type">{roomType}</p>}

          {title && <h4 className="review-title">{title}</h4>}

          {/* Pros and Cons */}
          {(pros || cons) && (
            <div className="review-pros-cons">
              {pros && (
                <div className="review-pros">
                  <ThumbsUp size={14} className="icon-green" />
                  <span>{pros}</span>
                </div>
              )}
              {cons && (
                <div className="review-cons">
                  <ThumbsDown size={14} className="icon-red" />
                  <span>{cons}</span>
                </div>
              )}
            </div>
          )}

          {text && <p className="review-text">{text}</p>}
        </div>
      </div>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';

/**
 * Reviews Section Component
 * Displays overall rating, breakdown, and individual reviews
 *
 * @param {Object} props - Component props
 * @param {number} props.overallRating - Overall rating score
 * @param {number} props.totalReviews - Total number of reviews
 * @param {Object} props.ratingBreakdown - Breakdown of ratings by category
 * @param {Array} props.reviews - Array of review objects
 * @param {boolean} props.loading - Loading state
 */
const ReviewsSection = memo(({
  overallRating = 0,
  totalReviews = 0,
  ratingBreakdown = {},
  reviews = [],
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const hasReviews = reviews.length > 0;
  const hasRatingData = overallRating > 0 || totalReviews > 0;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handleNextPage = () => {
    toast.info('Next page');
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePrevPage = () => {
    toast.info('Previous page');
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Loading state
  if (loading) {
    return (
      <div className="reviews-section">
        <div className="reviews-header">
          <h2 className="reviews-title">User Ratings & Reviews</h2>
        </div>
        <div className="reviews-loading">
          <Loader2 className="spinner" size={24} />
          <span>Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      {/* Section Header */}
      <div className="reviews-header">
        <h2 className="reviews-title">User Ratings & Reviews</h2>
        <button
          className="reviews-submit-button"
          onClick={() => toast.info('Opening review form...')}
        >
          Give your review
        </button>
      </div>

      {/* Overall Rating - only show if we have rating data */}
      {hasRatingData && (
        <div className="reviews-overall">
          {/* Rating Score */}
          <div className="reviews-score">
            <div className="reviews-score-number">{typeof overallRating === 'number' ? overallRating.toFixed(1) : overallRating}</div>
            <div className="reviews-score-label">{getRatingText(overallRating)}</div>
            <div className="reviews-score-count">{totalReviews} verified reviews</div>
          </div>

          {/* Rating Breakdown */}
          {Object.keys(ratingBreakdown).length > 0 && (
            <div className="reviews-breakdown">
              {Object.entries(ratingBreakdown).map(([category, score]) => (
                <div key={category} className="reviews-breakdown-item">
                  <div className="reviews-breakdown-label">{category}</div>
                  <div className="reviews-breakdown-bar-container">
                    <div
                      className="reviews-breakdown-bar"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="reviews-breakdown-score">{score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Reviews Message */}
      {!hasReviews && !loading && (
        <div className="reviews-empty">
          <MessageSquare size={48} className="reviews-empty-icon" />
          <h3>No Reviews Yet</h3>
          <p>Be the first to share your experience at this property.</p>
        </div>
      )}

      {/* Reviews List */}
      {hasReviews && (
        <div className="reviews-list">
          {currentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="reviews-pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="reviews-pagination-button"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="reviews-pagination-info">
            {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="reviews-pagination-button"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
});

ReviewsSection.displayName = 'ReviewsSection';

export default ReviewsSection;
