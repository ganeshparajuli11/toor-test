# Testing Amadeus API Integration in Hotels Page

## Setup Verification

### 1. Check Environment Variables

First, verify your `.env` file is configured correctly:

```bash
# Should show your Amadeus credentials
cat .env
```

Expected content:
```
VITE_API_BASE_URL=https://test.api.amadeus.com
VITE_API_KEY="your_api_key"
VITE_API_SECRET="your_api_secret"
VITE_AMADEUS_AUTH_URL=https://test.api.amadeus.com/v1/security/oauth2/token
...
```

### 2. Install Dependencies & Start Dev Server

```bash
npm install
npm run dev
```

## Testing the Hotels Page

### Test 1: Demo Mode (Without Dates)

1. Navigate to: `http://localhost:5173/hotels`
2. Expected Result:
   - Yellow banner: "⚠️ Demo Mode"
   - Shows 6 demo hotels
   - Message: "Using demo data. Add check-in/out dates or verify API credentials to use live data."

### Test 2: Live API Mode (With Valid Dates)

1. Navigate to: `http://localhost:5173/hotels?location=PAR&checkIn=2024-12-20&checkOut=2024-12-25&adults=2&rooms=1`
2. Expected Result:
   - Green banner: "✓ Live Amadeus API"
   - Shows real hotels from Amadeus
   - Success toast: "Found X hotels from Amadeus API"
   - Hotels display with real prices and data

### Test 3: Different Cities

Try these URLs to test different city codes:

**Paris:**
```
http://localhost:5173/hotels?location=PAR&checkIn=2024-12-20&checkOut=2024-12-25&adults=2
```

**London:**
```
http://localhost:5173/hotels?location=LON&checkIn=2024-12-20&checkOut=2024-12-25&adults=2
```

**New York:**
```
http://localhost:5173/hotels?location=NYC&checkIn=2024-12-20&checkOut=2024-12-25&adults=2
```

**Madrid:**
```
http://localhost:5173/hotels?location=MAD&checkIn=2024-12-20&checkOut=2024-12-25&adults=2
```

## Debugging

### Check Browser Console

Open Developer Tools (F12) and check:

1. **Network Tab:**
   - Look for request to `https://test.api.amadeus.com/v1/security/oauth2/token`
   - Should return status 200 with access_token
   - Look for request to `https://test.api.amadeus.com/v3/shopping/hotel-offers`
   - Should return status 200 with hotel data

2. **Console Tab:**
   - Should see: "Found X hotels from Amadeus API" (if successful)
   - Should see: "Using demo data..." (if using fallback)
   - Look for any error messages

### Common Issues

#### Issue 1: "Authentication failed"
**Cause:** Invalid API credentials
**Solution:**
- Verify `VITE_API_KEY` and `VITE_API_SECRET` in `.env`
- Make sure you're using Amadeus Self-Service API credentials (not Enterprise)
- Restart dev server after changing `.env`

#### Issue 2: "Invalid city code"
**Cause:** City code is not a valid IATA code
**Solution:**
- Use 3-letter IATA codes (PAR, LON, NYC, etc.)
- Check: https://www.iata.org/en/publications/directories/code-search/

#### Issue 3: CORS Error
**Cause:** Browser blocking direct API calls
**Solution:**
- This is normal in development
- Amadeus test API should allow CORS
- If persistent, you may need a backend proxy

#### Issue 4: Rate Limit Exceeded
**Cause:** Too many API requests
**Solution:**
- Wait a few minutes
- Test environment has limited quota
- Consider implementing request throttling

## Verification Checklist

- [ ] Dev server starts without errors
- [ ] Hotels page loads with demo data (without dates)
- [ ] Yellow "Demo Mode" banner appears
- [ ] Search with dates triggers API call
- [ ] Green "Live Amadeus API" banner appears
- [ ] Real hotel data is displayed
- [ ] Prices show correct currency
- [ ] Success toast notification appears
- [ ] No console errors
- [ ] Network requests show 200 status

## Expected API Response Structure

When successful, the Amadeus API returns:

```json
{
  "data": [
    {
      "type": "hotel-offers",
      "hotel": {
        "hotelId": "BGMILBGB",
        "name": "Hotel Name",
        "cityCode": "PAR",
        "rating": "4"
      },
      "offers": [
        {
          "id": "offer-id",
          "checkInDate": "2024-12-20",
          "checkOutDate": "2024-12-25",
          "price": {
            "total": "350.00",
            "currency": "EUR"
          },
          "room": {
            "description": {
              "text": "Room description"
            }
          }
        }
      ]
    }
  ],
  "meta": {
    "count": 10
  }
}
```

## Next Steps After Verification

Once Hotels.jsx is working:

1. Update `Flights.jsx` to use `FLIGHT_OFFERS_SEARCH` endpoint
2. Update `Cars.jsx` to use `CAR_RENTAL_SEARCH` endpoint
3. Update `Cruises.jsx` (Amadeus doesn't have cruise API, keep demo data)
4. Implement proper image handling (Amadeus doesn't provide hotel images)
5. Add error boundary components
6. Implement pagination for results
7. Add loading skeletons
8. Enhance filter functionality with API parameters

## Support

If you encounter issues:
1. Check the `AMADEUS_INTEGRATION_GUIDE.md` file
2. Review Amadeus docs: https://developers.amadeus.com/
3. Check API status: https://developers.amadeus.com/status
