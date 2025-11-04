import React, { memo, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import './ReviewsSection.css';

/**
 * Review Card Component
 */
const ReviewCard = memo(({ review }) => {
  const { rating, title, text, userName, userAvatar, date } = review;

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
                  {rating}
                </div>
                <span className="review-rating-text">Amazing</span>
              </div>
              <p className="review-user-name">{userName}</p>
            </div>
            <button
              className="review-report-button"
              aria-label="Report review"
              onClick={() => toast.info('Reporting review...')}
            >
              <Flag size={18} />
            </button>
          </div>

          <h4 className="review-title">{title}</h4>
          <p className="review-text">{text}</p>
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
 */
const ReviewsSection = memo(({
  overallRating = 4.2,
  totalReviews = 171,
  ratingBreakdown = {
    'Staff/service': 4.5,
    'Location': 4.2,
    'Amenities': 4.3,
    'Hospitality': 4.4,
    'Food': 4.5,
  },
  reviews = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Default reviews if none provided
  const defaultReviews = [
    {
      id: 1,
      rating: 5.0,
      title: 'Amazing',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      userName: 'John Doe',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      date: '2024-01-15',
    },
    {
      id: 2,
      rating: 5.0,
      title: 'Amazing',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      userName: 'Jane Smith',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      date: '2024-01-14',
    },
    {
      id: 3,
      rating: 5.0,
      title: 'Amazing',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      userName: 'Mike Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      date: '2024-01-13',
    },
    {
      id: 4,
      rating: 5.0,
      title: 'Amazing',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      userName: 'Sarah Williams',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      date: '2024-01-12',
    },
    {
      id: 5,
      rating: 4.5,
      title: 'Amazing',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      userName: 'David Brown',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      date: '2024-01-11',
    },
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
  const totalPages = Math.ceil(displayReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = displayReviews.slice(startIndex, endIndex);

  const handleNextPage = () => {
    toast.info('Next page');
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePrevPage = () => {
    toast.info('Previous page');
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

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

      {/* Overall Rating */}
      <div className="reviews-overall">
        {/* Rating Score */}
        <div className="reviews-score">
          <div className="reviews-score-number">{overallRating}</div>
          <div className="reviews-score-label">Very good</div>
          <div className="reviews-score-count">{totalReviews} verified reviews</div>
        </div>

        {/* Rating Breakdown */}
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
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {currentReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

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
