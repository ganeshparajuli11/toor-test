import { useState, useCallback, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

/**
 * LocationSearch Component
 *
 * Provides autocomplete search for locations using Booking.com searchDestination API
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

  // Search for locations using Booking.com API
  const loadOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    try {
      const response = await axios.get(
        `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination`,
        {
          params: { query: inputValue },
          headers: {
            'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
          },
          timeout: 10000,
        }
      );

      if (response.data?.status && response.data?.data) {
        // Transform API response to react-select format
        return response.data.data.slice(0, 10).map((location) => ({
          value: location.dest_id,
          label: location.label,
          data: location, // Keep full location data for reference
        }));
      }

      return [];
    } catch (error) {
      console.error('Location search error:', error);
      // Return popular cities as fallback
      return [
        { value: '-1456928', label: 'Paris, Île-de-France, France', data: { dest_id: '-1456928', search_type: 'city' } },
        { value: '-2601889', label: 'London, Greater London, United Kingdom', data: { dest_id: '-2601889', search_type: 'city' } },
        { value: '-2092174', label: 'New York, New York State, United States', data: { dest_id: '-2092174', search_type: 'city' } },
        { value: '-246227', label: 'Tokyo, Tokyo Prefecture, Japan', data: { dest_id: '-246227', search_type: 'city' } },
        { value: '-782831', label: 'Dubai, Dubai, United Arab Emirates', data: { dest_id: '-782831', search_type: 'city' } },
      ];
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
      defaultOptions
      loadingMessage={() => 'Searching locations...'}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2
          ? 'Type at least 2 characters to search'
          : 'No locations found'
      }
    />
  );
};

export default LocationSearch;
