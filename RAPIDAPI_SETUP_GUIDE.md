# RapidAPI Setup Guide - Complete Integration

## ⚠️ CURRENT STATUS
Your API key is configured, but you need to **subscribe to the Booking.com v15 API** to enable live hotel data.

**What works now:**
- ✅ Demo hotel data (fallback mode)
- ✅ Search functionality with 15+ major cities
- ✅ All UI components

**To enable live data:**
- ❌ Subscribe to [Booking.com v15 API](https://rapidapi.com/DataCrawler/api/booking-com15) (FREE tier available)

## Overview
Your travel platform is now configured to use **RapidAPI** - a unified platform that gives you access to multiple travel APIs with a single API key!

### What's Included:
- ✅ Hotels (Booking.com API)
- ✅ Flights (Skyscanner API)
- ✅ Car Rentals (Rental Cars API)
- ✅ Activities (Travel Advisor API)
- ✅ Cruises (Booking.com API)

---

## 🚀 Quick Setup (3 Easy Steps)

### Step 1: Create RapidAPI Account (FREE)

1. Go to **[https://rapidapi.com/auth/sign-up](https://rapidapi.com/auth/sign-up)**
2. Sign up with Google/GitHub or email (takes 30 seconds)
3. Verify your email

### Step 2: Get Your API Key

1. After signing in, go to **[https://rapidapi.com/](https://rapidapi.com/)**
2. Click on your profile (top right) → **"My Apps"**
3. You'll see your default app with an **API key** - Copy it!
   - Example: `1234567890abcdef1234567890abcdef`

### Step 3: Update Your .env File

Open your `.env` file and replace `your_rapidapi_key_here` with your actual key:

```env
VITE_RAPIDAPI_KEY=1234567890abcdef1234567890abcdef
```

**That's it!** You're ready to use the APIs! 🎉

---

## 📋 Subscribe to Free APIs

To use the travel services, you need to subscribe to each API (all have **FREE tiers**):

### 1. Hotels API (Booking.com v15) - **REQUIRED FOR HOTELS**
- **Link**: [https://rapidapi.com/DataCrawler/api/booking-com15](https://rapidapi.com/DataCrawler/api/booking-com15)
- **Free Tier**: 100-500 requests/month (depending on plan)
- **Click**: "Subscribe to Test" → Select "Basic (Free)" plan
- **⚠️ IMPORTANT**: You MUST subscribe to this API for hotel search to work!

### 2. Flights API (Skyscanner)
- **Link**: [https://rapidapi.com/skyscanner/api/skyscanner-flight-search](https://rapidapi.com/skyscanner/api/skyscanner-flight-search)
- **Free Tier**: 500 requests/month
- **Click**: "Subscribe to Test" → Select "Basic (Free)" plan

### 3. Car Rentals API
- **Link**: [https://rapidapi.com/tipsters/api/rental-cars](https://rapidapi.com/tipsters/api/rental-cars)
- **Free Tier**: 500 requests/month
- **Click**: "Subscribe to Test" → Select "Basic (Free)" plan

### 4. Activities API (Travel Advisor)
- **Link**: [https://rapidapi.com/apidojo/api/travel-advisor](https://rapidapi.com/apidojo/api/travel-advisor)
- **Free Tier**: 500 requests/month
- **Click**: "Subscribe to Test" → Select "Basic (Free)" plan

---

## 🎯 Usage Examples

### Example 1: Search Hotels

```javascript
import { API_ENDPOINTS } from '../config/api';
import useApi from '../hooks/useApi';

function HotelSearch() {
  const { data, loading, error } = useApi(API_ENDPOINTS.HOTEL_SEARCH, {
    params: {
      dest_id: '-553173',  // Paris (get from location search)
      checkin_date: '2024-12-20',
      checkout_date: '2024-12-25',
      adults_number: 2,
      room_number: 1,
      units: 'metric',
      currency_code: 'USD',
    },
  });

  if (loading) return <div>Loading hotels...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.result?.map(hotel => (
        <div key={hotel.hotel_id}>
          <h3>{hotel.hotel_name}</h3>
          <p>Price: ${hotel.min_total_price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Search Flights

```javascript
import { API_ENDPOINTS, buildFlightSearchRequest } from '../config/api';
import axios from 'axios';

async function searchFlights() {
  const request = buildFlightSearchRequest({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2024-12-20',
    adults: 1,
  });

  try {
    const response = await axios.post(request.url, request.data, {
      headers: request.headers,
    });
    console.log('Flights:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 3: Search Cars

```javascript
import { API_ENDPOINTS } from '../config/api';
import useApi from '../hooks/useApi';

function CarSearch() {
  const { data, loading, error } = useApi(API_ENDPOINTS.CAR_SEARCH, {
    params: {
      pick_up_location: 'LAX',
      drop_off_location: 'LAX',
      pick_up_date: '2024-12-20',
      drop_off_date: '2024-12-25',
      driver_age: 30,
    },
  });

  if (loading) return <div>Loading cars...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.results?.map(car => (
        <div key={car.vehicle_id}>
          <h3>{car.vehicle_name}</h3>
          <p>Price: ${car.price_per_day}/day</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Location Autocomplete

```javascript
import { API_ENDPOINTS } from '../config/api';
import useApi from '../hooks/useApi';

function LocationSearch({ query }) {
  const { data, loading } = useApi(API_ENDPOINTS.LOCATION_SEARCH, {
    params: {
      name: query,
      locale: 'en-us',
    },
    dependencies: [query],
  });

  return (
    <div>
      {data?.result?.map(location => (
        <div key={location.dest_id}>
          {location.label}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Helper Functions

The project includes helper functions to make API calls easier:

### Build Hotel Search Request
```javascript
import { buildHotelSearchRequest } from '../config/api';

const request = buildHotelSearchRequest({
  location: '-553173',  // Paris
  checkIn: '2024-12-20',
  checkOut: '2024-12-25',
  adults: 2,
  rooms: 1,
});
```

### Build Flight Search Request
```javascript
import { buildFlightSearchRequest } from '../config/api';

const request = buildFlightSearchRequest({
  origin: 'JFK',
  destination: 'LAX',
  departureDate: '2024-12-20',
  adults: 1,
});
```

### Build Car Search Request
```javascript
import { buildCarSearchRequest } from '../config/api';

const request = buildCarSearchRequest({
  pickupLocation: 'LAX',
  pickupDate: '2024-12-20',
  dropoffDate: '2024-12-25',
});
```

---

## 📊 API Response Formats

### Hotel Search Response
```json
{
  "result": [
    {
      "hotel_id": 123456,
      "hotel_name": "Grand Hotel",
      "min_total_price": 150,
      "address": "123 Main St",
      "review_score": 8.5,
      "review_score_word": "Excellent"
    }
  ]
}
```

### Flight Search Response
```json
{
  "data": {
    "itineraries": [
      {
        "id": "abc123",
        "price": {
          "amount": 250,
          "currency": "USD"
        },
        "legs": [...]
      }
    ]
  }
}
```

---

## ⚙️ Configuration

All configuration is in these files:

### `.env` - Environment Variables
```env
VITE_RAPIDAPI_KEY=your_api_key_here
VITE_HOTELS_API_HOST=booking-com15.p.rapidapi.com
VITE_FLIGHTS_API_HOST=skyscanner-flight-search.p.rapidapi.com
VITE_CARS_API_HOST=rental-cars.p.rapidapi.com
```

### `src/config/api.js` - API Configuration
- API endpoints
- Helper functions
- Default settings

### `src/services/amadeusAuth.js` - Authentication
- RapidAPI key management
- Header generation

### `src/hooks/useApi.js` - API Hook
- Data fetching
- Caching
- Error handling

---

## 🚨 Troubleshooting

### Issue: "API key is not configured"
**Solution**:
1. Check your `.env` file exists
2. Make sure `VITE_RAPIDAPI_KEY` is set
3. Restart your dev server: `npm run dev`

### Issue: "You are not subscribed to this API"
**Solution**:
1. Go to the API page on RapidAPI
2. Click "Subscribe to Test"
3. Select the free plan

### Issue: "Rate limit exceeded"
**Solution**:
- Free tier: 500 requests/month per API
- Upgrade to paid plan for more requests
- Or wait until next month for quota reset

### Issue: "Invalid location code"
**Solution**:
- Use the Location Search API first to get valid location IDs
- Hotels use `dest_id` (e.g., `-553173` for Paris)
- Flights use IATA codes (e.g., `JFK`, `LAX`)

### Issue: CORS errors
**Solution**:
- RapidAPI handles CORS automatically
- Make sure you're using the correct API host
- Check that your API key is correct

---

## 💡 Tips & Best Practices

### 1. Caching
The `useApi` hook automatically caches GET requests for 5 minutes:
```javascript
const { data } = useApi(endpoint, {
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 2. Error Handling
Always handle errors gracefully:
```javascript
const { data, error, loading } = useApi(endpoint);

if (error) {
  return <ErrorMessage message={error} />;
}
```

### 3. Loading States
Show loading indicators for better UX:
```javascript
if (loading) {
  return <LoadingSpinner />;
}
```

### 4. Rate Limiting
Monitor your usage in RapidAPI dashboard:
- **[https://rapidapi.com/developer/dashboard](https://rapidapi.com/developer/dashboard)**

### 5. Testing
Test with small datasets first:
```javascript
params: {
  limit: 10,  // Start small
}
```

---

## 📈 Free Tier Limits

| API | Free Requests/Month | Paid Plans Start At |
|-----|---------------------|---------------------|
| Hotels (Booking.com) | 500 | $10/month |
| Flights (Skyscanner) | 500 | $10/month |
| Cars (Rental Cars) | 500 | $10/month |
| Activities (Travel Advisor) | 500 | $5/month |

**Total Free**: 2,000 requests/month across all APIs!

---

## 🔐 Security

### ✅ DO:
- Keep your API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate keys periodically

### ❌ DON'T:
- Commit `.env` to git
- Share your API key publicly
- Use API key in client-side code (use backend proxy for production)
- Hardcode API keys

---

## 📚 Additional Resources

- **RapidAPI Docs**: [https://docs.rapidapi.com/](https://docs.rapidapi.com/)
- **Booking.com API**: [https://rapidapi.com/tipsters/api/booking-com](https://rapidapi.com/tipsters/api/booking-com)
- **Skyscanner API**: [https://rapidapi.com/skyscanner/api/skyscanner-flight-search](https://rapidapi.com/skyscanner/api/skyscanner-flight-search)
- **Support**: [https://rapidapi.com/support](https://rapidapi.com/support)

---

## 🎉 You're All Set!

Your travel platform is now configured with RapidAPI. To get started:

1. ✅ Get your RapidAPI key
2. ✅ Update `.env` file
3. ✅ Subscribe to free APIs
4. ✅ Start coding!

```bash
# Start your dev server
npm run dev
```

Happy coding! 🚀
