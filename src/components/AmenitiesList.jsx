import React, { memo, useState } from 'react';
import {
  Wifi,
  Utensils,
  Dumbbell,
  Car,
  Coffee,
  Wind,
  Waves,
  Home,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AmenitiesList.css';

/**
 * Amenity Icon Mapping
 */
const amenityIcons = {
  'Free wifi': Wifi,
  'Free Wi-Fi': Wifi,
  'Indoor pool': Waves,
  'Restaurant': Utensils,
  'Room service': Home,
  'Parking available': Car,
  'Air Conditioning': Wind,
  'Fitness center': Dumbbell,
  'Bar/Lounge': Coffee,
  'Tea/Coffee machine': Coffee,
  'Business Services': Briefcase,
};

/**
 * Get icon component for amenity
 */
const getAmenityIcon = (amenity) => {
  const IconComponent = amenityIcons[amenity] || Home;
  return IconComponent;
};

/**
 * Amenities List Component
 * Displays property amenities in a grid with icons
 *
 * @param {Object} props - Component props
 * @param {Array} props.amenities - Array of amenity names
 * @param {number} props.initialDisplayCount - Initial number of amenities to show
 */
const AmenitiesList = memo(({ amenities = [], initialDisplayCount = 10 }) => {
  const [showAll, setShowAll] = useState(false);

  // Default amenities if none provided
  const defaultAmenities = [
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
  ];

  const displayAmenities = amenities.length > 0 ? amenities : defaultAmenities;
  const visibleAmenities = showAll
    ? displayAmenities
    : displayAmenities.slice(0, initialDisplayCount);
  const hasMore = displayAmenities.length > initialDisplayCount;

  const handleToggle = () => {
    if (!showAll) {
      toast.info('Showing all amenities');
    } else {
      toast.info('Showing less');
    }
    setShowAll(!showAll);
  };

  return (
    <div className="amenities-section">
      <h2 className="amenities-title">Amenities</h2>

      {/* Amenities Grid */}
      <div className="amenities-grid">
        {visibleAmenities.map((amenity, index) => {
          const IconComponent = getAmenityIcon(amenity);
          return (
            <div key={index} className="amenity-item">
              <div className="amenity-icon-wrapper">
                <IconComponent className="amenity-icon" size={20} />
              </div>
              <span className="amenity-name">{amenity}</span>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          onClick={handleToggle}
          className="amenities-toggle"
        >
          <span>{showAll ? 'Show less' : `+${displayAmenities.length - initialDisplayCount} more`}</span>
          {showAll ? <ChevronUp size={20} className="amenities-toggle-icon" /> : <ChevronDown size={20} className="amenities-toggle-icon" />}
        </button>
      )}
    </div>
  );
});

AmenitiesList.displayName = 'AmenitiesList';

export default AmenitiesList;
