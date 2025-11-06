# Amadeus API Integration Guide

## Overview
This project is now configured to use the Amadeus Travel API for fetching real-time travel data including flights, hotels, car rentals, and activities.

## Setup Instructions

### 1. Get Your Amadeus API Credentials

1. Visit [Amadeus for Developers](https://developers.amadeus.com/)
2. Sign up for a free account
3. Go to [API Keys](https://developers.amadeus.com/self-service/category/api-keys)
4. Create a new app to get your API Key and API Secret

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual Amadeus credentials:
   ```env
   VITE_API_KEY="your_actual_api_key"
   VITE_API_SECRET="your_actual_api_secret"
   ```

### 3. Environment Options

**Test Environment** (Default - Free tier available):
```env
VITE_API_BASE_URL=https://test.api.amadeus.com
```

**Production Environment** (Requires paid plan):
```env
VITE_API_BASE_URL=https://api.amadeus.com
```

## How It Works

### Authentication Flow

The project uses OAuth2 Client Credentials flow:

1. **Automatic Token Management**: The `amadeusAuth.js` service automatically handles:
   - Requesting access tokens
   - Token caching
   - Token refresh before expiration
   - Error handling

2. **Transparent Integration**: The `useApi` hook automatically adds authentication headers to all Amadeus API requests.

### Project Structure

```
src/
├── config/
│   └── api.js                 # API configuration and endpoints
├── services/
│   └── amadeusAuth.js        # Authentication service
├── hooks/
│   ├── useApi.js             # Main API hook with auth
│   └── useTravelData.js      # Travel-specific data fetching
└── pages/
    ├── Flights.jsx           # Flight search page
    ├── Hotels.jsx            # Hotel search page
    ├── Cars.jsx              # Car rental page
    └── ...
```

## Available Amadeus Endpoints

The project is configured with the following Amadeus API endpoints:

### Hotels & Accommodation
- `HOTEL_SEARCH` - Search hotel offers
- `HOTEL_OFFERS` - Get offers by hotel
- `HOTEL_BOOKING` - Create hotel bookings
- `HOTEL_RATINGS` - Get hotel ratings and reviews

### Flights
- `FLIGHT_OFFERS_SEARCH` - Search flight offers
- `FLIGHT_OFFERS_PRICE` - Confirm flight pricing
- `FLIGHT_CREATE_ORDER` - Create flight bookings
- `FLIGHT_INSPIRATION_SEARCH` - Get flight destinations
- `FLIGHT_CHEAPEST_DATE` - Find cheapest dates
- `AIRPORT_ROUTES` - Get airport routes

### Car Rentals
- `CAR_RENTAL_SEARCH` - Search car rentals
- `CAR_RENTAL_OFFERS` - Get specific car offers

### Activities & Tours
- `ACTIVITIES` - Search activities
- `ACTIVITIES_BY_SQUARE` - Get activities by location

### Location & Reference Data
- `AIRPORT_CITY_SEARCH` - Search airports and cities
- `AIRPORT_NEAREST` - Find nearest airports
- `AIRLINE_CODE_LOOKUP` - Lookup airline information

## Usage Examples

### Example 1: Search for Flights

```javascript
import { API_ENDPOINTS } from '../config/api';
import useApi from '../hooks/useApi';

function FlightSearch() {
  const { data, loading, error } = useApi(API_ENDPOINTS.FLIGHT_OFFERS_SEARCH, {
    params: {
      originLocationCode: 'NYC',
      destinationLocationCode: 'LAX',
      departureDate: '2024-12-15',
      adults: 1,
      max: 10
    },
    isAmadeusAPI: true
  });

  if (loading) return <div>Loading flights...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.data?.map(flight => (
        <div key={flight.id}>
          {/* Display flight information */}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Search for Hotels

```javascript
import { API_ENDPOINTS } from '../config/api';
import useApi from '../hooks/useApi';

function HotelSearch() {
  const { data, loading, error } = useApi(API_ENDPOINTS.HOTEL_SEARCH, {
    params: {
      cityCode: 'PAR',
      checkInDate: '2024-12-15',
      checkOutDate: '2024-12-20',
      adults: 2,
      radius: 5,
      radiusUnit: 'KM',
      ratings: '4,5'
    },
    isAmadeusAPI: true
  });

  if (loading) return <div>Loading hotels...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.data?.map(hotel => (
        <div key={hotel.hotel.hotelId}>
          {/* Display hotel information */}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Search for Airport/City

```javascript
import { API_ENDPOINTS } from '../config/api';
import useApi from '../hooks/useApi';

function LocationSearch({ searchTerm }) {
  const { data, loading, error } = useApi(API_ENDPOINTS.AIRPORT_CITY_SEARCH, {
    params: {
      keyword: searchTerm,
      subType: 'AIRPORT,CITY'
    },
    isAmadeusAPI: true,
    immediate: false
  });

  return (
    <div>
      {data?.data?.map(location => (
        <div key={location.id}>
          {location.name} ({location.iataCode})
        </div>
      ))}
    </div>
  );
}
```

## API Response Structure

Amadeus API responses follow this general structure:

```json
{
  "data": [...],           // Array of results
  "meta": {
    "count": 10,          // Number of results
    "links": {
      "self": "...",      // Current page
      "next": "..."       // Next page (if available)
    }
  },
  "dictionaries": {...}   // Reference data (airlines, aircraft, etc.)
}
```

## Error Handling

The `useApi` hook automatically handles errors:

```javascript
const { data, loading, error } = useApi(endpoint, options);

if (error) {
  // Error is automatically extracted from:
  // - err.response.data.errors[0].detail (Amadeus format)
  // - err.response.data.message
  // - err.message
  console.error('API Error:', error);
}
```

## Rate Limits

**Test Environment**:
- Free tier: 10 transactions per second
- Limited monthly quota
- Test data only

**Production Environment**:
- Higher rate limits
- Real-time data
- Requires paid subscription

## Important Notes

1. **Security**: Never commit your `.env` file or expose your API credentials
2. **Test Data**: Test environment returns sample data for development
3. **Fallback Data**: The app includes fallback data that's used when API calls fail
4. **Token Caching**: Access tokens are automatically cached and refreshed
5. **CORS**: If you encounter CORS issues, you may need a backend proxy

## Troubleshooting

### Issue: "Authentication failed"
**Solution**: Verify your API_KEY and API_SECRET in `.env` file

### Issue: "Invalid date format"
**Solution**: Amadeus requires dates in YYYY-MM-DD format

### Issue: "Invalid location code"
**Solution**: Use IATA codes (e.g., 'NYC', 'LAX', 'LON')

### Issue: "Rate limit exceeded"
**Solution**: Implement request throttling or upgrade your plan

## Additional Resources

- [Amadeus API Documentation](https://developers.amadeus.com/self-service/apis-docs)
- [Quick Start Guide](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/quick-start)
- [API Reference](https://developers.amadeus.com/self-service/category/flights)
- [Code Examples](https://github.com/amadeus4dev)

## Support

For API-related issues, contact Amadeus support at:
- Email: developers@amadeus.com
- Community: https://developers.amadeus.com/support

For project-related issues, check the project repository.
