import React, { memo, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './FilterSidebar.css';

/**
 * Filter Sidebar Component
 * Contains all filters for property search
 *
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onToggleFilter - Handler for checkbox filters
 * @param {Function} props.onToggleArrayFilter - Handler for array filters
 * @param {Function} props.onUpdatePriceRange - Handler for price range
 * @param {Function} props.onResetFilters - Handler to reset all filters
 */
const FilterSidebar = memo(({
  filters,
  onToggleFilter,
  onToggleArrayFilter,
  onUpdatePriceRange,
  onResetFilters,
}) => {
  const [minPrice, setMinPrice] = useState(filters.priceMin);
  const [maxPrice, setMaxPrice] = useState(filters.priceMax);

  // Suggested filters
  const suggestedFilters = [
    { key: 'lastMinuteDeals', label: 'Last Minute Deals', count: 248 },
    { key: 'freeCancellation', label: 'Free Cancellation', count: 0 },
    { key: 'payAtHotel', label: 'Pay @ Hotel Available', count: 0 },
    { key: 'breakfastIncluded', label: 'Breakfast Included', count: 503 },
    { key: 'breakfastLunchDinner', label: 'Breakfast + Lunch/Dinner', count: 27 },
    { key: 'allMealsIncluded', label: 'All Meals Included', count: 88 },
  ];

  // Price ranges
  const priceRanges = [
    { min: 13, max: 30, count: 11 },
    { min: 30, max: 60, count: 189 },
    { min: 60, max: 97, count: 221 },
    { min: 97, max: 152, count: 130 },
    { min: 152, max: 182, count: 85 },
    { min: 182, max: 365, count: 132 },
    { min: 365, max: Infinity, label: '$ 365+', count: 34 },
  ];

  // Star categories
  const starCategories = [
    { value: 5, count: 18 },
    { value: 4, count: 37 },
    { value: 3, count: 374 },
  ];

  // User ratings
  const userRatings = [
    { value: 4.5, label: '4.5 & above (Excellent)', count: 33 },
    { value: 4, label: '4 & above (Very Good)', count: 226 },
    { value: 3, label: '3 & above (Good)', count: 588 },
  ];

  // Property types
  const propertyTypes = [
    { value: 'hotel', label: 'Hotel', count: 530 },
    { value: 'homestay', label: 'Homestay', count: 114 },
    { value: 'resort', label: 'Resort', count: 90 },
    { value: 'camp', label: 'Camp', count: 30 },
    { value: 'villa', label: 'Villa', count: 38 },
  ];

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    onUpdatePriceRange(Number(minPrice), Number(maxPrice));
    toast.info('Price filter applied');
  };

  const handleFilterToggle = (filterKey) => {
    onToggleFilter(filterKey);
    toast.info('Filter applied');
  };

  const handleArrayFilterToggle = (filterKey, value) => {
    onToggleArrayFilter(filterKey, value);
    toast.info('Filter applied');
  };

  const handleResetFilters = () => {
    onResetFilters();
    toast.success('Filters reset');
  };

  return (
    <aside className="filter-sidebar">
      {/* Suggested For You */}
      <div className="filter-section">
        <h3 className="filter-section-title">Suggested For You</h3>
        <div className="filter-section-content">
          {suggestedFilters.map((filter) => (
            <label key={filter.key} className="filter-item">
              <div className="filter-item-left">
                <input
                  type="checkbox"
                  checked={filters[filter.key]}
                  onChange={() => handleFilterToggle(filter.key)}
                  className="filter-item-checkbox"
                />
                <span className="filter-item-label">
                  {filter.label}
                </span>
              </div>
              <span className="filter-item-count">({filter.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price per night */}
      <div className="filter-section">
        <h3 className="filter-section-title">Price per night</h3>
        <div className="filter-section-content">
          {priceRanges.map((range, index) => (
            <label key={index} className="filter-item">
              <div className="filter-item-left">
                <input
                  type="checkbox"
                  className="filter-item-checkbox"
                />
                <span className="filter-item-label">
                  {range.label || `$ ${range.min} - $ ${range.max}`}
                </span>
              </div>
              <span className="filter-item-count">({range.count})</span>
            </label>
          ))}
        </div>

        {/* Your Budget */}
        <div className="price-range-divider">
          <h4 className="price-range-title">Your Budget</h4>
          <form onSubmit={handlePriceSubmit} className="price-range-form">
            <div className="price-range-input-wrapper">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="price-range-input"
              />
            </div>
            <span className="price-range-separator">to</span>
            <div className="price-range-input-wrapper">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="price-range-input"
              />
            </div>
            <button
              type="submit"
              className="price-range-submit"
            >
              →
            </button>
          </form>
        </div>
      </div>

      {/* Star Category */}
      <div className="filter-section">
        <h3 className="filter-section-title">Star Category</h3>
        <div className="filter-section-content">
          {starCategories.map((star) => (
            <label key={star.value} className="filter-item">
              <div className="filter-item-left">
                <input
                  type="checkbox"
                  checked={filters.starRating.includes(star.value)}
                  onChange={() => handleArrayFilterToggle('starRating', star.value)}
                  className="filter-item-checkbox"
                />
                <div className="star-rating-item">
                  <span className="filter-item-label">
                    {star.value} Star
                  </span>
                </div>
              </div>
              <span className="filter-item-count">({star.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* User Rating */}
      <div className="filter-section">
        <h3 className="filter-section-title">User Rating</h3>
        <div className="filter-section-content">
          {userRatings.map((rating) => (
            <label key={rating.value} className="filter-item">
              <div className="filter-item-left">
                <input
                  type="checkbox"
                  checked={filters.userRating.includes(rating.value)}
                  onChange={() => handleArrayFilterToggle('userRating', rating.value)}
                  className="filter-item-checkbox"
                />
                <span className="filter-item-label">
                  {rating.label}
                </span>
              </div>
              <span className="filter-item-count">({rating.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="filter-section">
        <h3 className="filter-section-title">Property Type</h3>
        <div className="filter-section-content">
          {propertyTypes.slice(0, 4).map((type) => (
            <label key={type.value} className="filter-item">
              <div className="filter-item-left">
                <input
                  type="checkbox"
                  checked={filters.propertyTypes.includes(type.value)}
                  onChange={() => handleArrayFilterToggle('propertyTypes', type.value)}
                  className="filter-item-checkbox"
                />
                <span className="filter-item-label">
                  {type.label}
                </span>
              </div>
              <span className="filter-item-count">({type.count})</span>
            </label>
          ))}
        </div>
        <button className="filter-show-more">
          Show 4 more
        </button>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetFilters}
        className="filter-reset-button"
      >
        Reset All Filters
      </button>
    </aside>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
