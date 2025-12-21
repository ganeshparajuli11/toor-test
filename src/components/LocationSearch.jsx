import { useState, useCallback, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import ratehawkService from '../services/ratehawk.service';

// Popular destinations shown as default options - CORRECT RateHawk region IDs
const POPULAR_DESTINATIONS = [
  { value: '2734', label: 'Paris, France', data: { dest_id: '2734', search_type: 'City', label: 'Paris, France' } },
  { value: '2114', label: 'London, United Kingdom', data: { dest_id: '2114', search_type: 'City', label: 'London, United Kingdom' } },
  { value: '2621', label: 'New York, United States', data: { dest_id: '2621', search_type: 'City', label: 'New York, United States' } },
  { value: '3593', label: 'Tokyo, Japan', data: { dest_id: '3593', search_type: 'City', label: 'Tokyo, Japan' } },
  { value: '6053839', label: 'Dubai, United Arab Emirates', data: { dest_id: '6053839', search_type: 'City', label: 'Dubai, United Arab Emirates' } },
  { value: '513', label: 'Barcelona, Spain', data: { dest_id: '513', search_type: 'City', label: 'Barcelona, Spain' } },
  { value: '3023', label: 'Rome, Italy', data: { dest_id: '3023', search_type: 'City', label: 'Rome, Italy' } },
  { value: '378', label: 'Amsterdam, Netherlands', data: { dest_id: '378', search_type: 'City', label: 'Amsterdam, Netherlands' } },
];

/**
 * LocationSearch Component
 *
 * Provides autocomplete search for locations using RateHawk API
 * Returns destination with dest_id, search_type, and other details
 */
const LocationSearch = ({ value, onChange, placeholder = "Search for a city or destination..." }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Update selected option when value prop changes
  useEffect(() => {
    if (value && value.label) {
      setSelectedOption({
        value: value.dest_id,
        label: value.label,
        data: value
      });
    }
  }, [value]);

  // Load default options when dropdown opens
  const loadDefaultOptions = useCallback(async () => {
    try {
      // Try to fetch real suggestions for a popular search term
      const results = await ratehawkService.searchRegions('Par');
      if (results && results.length > 0) {
        return results.slice(0, 8).map((location) => ({
          value: location.id,
          label: location.label,
          data: {
            dest_id: location.id,
            search_type: location.type === 'Hotel' ? 'HOTEL' : 'REGION',
            label: location.label,
            ...location
          }
        }));
      }
    } catch (error) {
      console.warn('Failed to load default options:', error);
    }
    // Return popular destinations as fallback
    return POPULAR_DESTINATIONS;
  }, []);

  // Search for locations using RateHawk API
  const loadOptions = useCallback(async (inputValue) => {
    // If no input, return popular destinations
    if (!inputValue || inputValue.length < 2) {
      return POPULAR_DESTINATIONS;
    }

    try {
      const results = await ratehawkService.searchRegions(inputValue);

      if (results && results.length > 0) {
        return results.slice(0, 10).map((location) => ({
          value: location.id, // This is the region_ID needed for searchHotels
          label: location.label,
          data: {
            dest_id: location.id,
            search_type: location.type === 'Hotel' ? 'HOTEL' : 'REGION',
            label: location.label,
            ...location
          }
        }));
      }

      return POPULAR_DESTINATIONS;
    } catch (error) {
      console.error('Location search error:', error);
      // Return popular cities as fallback
      return POPULAR_DESTINATIONS;
    }
  }, []);

  const handleChange = (option) => {
    setSelectedOption(option);
    if (onChange && option?.data) {
      onChange(option.data);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      borderRadius: '12px',
      border: state.isFocused ? '2px solid #0066ff' : '2px solid #e5e7eb',
      boxShadow: 'none',
      '&:hover': {
        border: '2px solid #0066ff',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
    }),
    option: (base, state) => ({
      ...base,
      padding: '12px 16px',
      backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
      color: '#1f2937',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#e5e7eb',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
    input: (base) => ({
      ...base,
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1f2937',
      fontSize: '16px',
    }),
    loadingMessage: (base) => ({
      ...base,
      padding: '12px 16px',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      padding: '12px 16px',
    }),
  };

  return (
    <AsyncSelect
      value={selectedOption}
      onChange={handleChange}
      loadOptions={loadOptions}
      placeholder={placeholder}
      styles={customStyles}
      isClearable
      cacheOptions
      defaultOptions={POPULAR_DESTINATIONS}
      loadingMessage={() => 'Searching locations...'}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2
          ? 'Start typing to search for destinations'
          : 'No locations found'
      }
    />
  );
};

export default LocationSearch;
