# Hotels Search Debugging Guide

## 🔍 How to Debug the Hotel Search

### Step 1: Open Developer Tools

1. Go to http://localhost:5174/hotels
2. Press **F12** or **Right-click → Inspect**
3. Click on **Console** tab
4. Clear the console (trash icon or Ctrl+L)

### Step 2: Perform a Search

1. Type a city name (e.g., "Kathmandu", "Pokhara", "Paris")
2. **Wait for dropdown** to show locations
3. **Select a location** from the dropdown
4. Make sure **dates are selected** (check-in and check-out)
5. **Click the Search button**

### Step 3: Check Console Logs

You should see these logs in order:

#### 1. Location Search (While Typing)
```
=== Hotels Debug ===
Selected Location: {dest_id: "-1022488", search_type: "city", label: "Pokhara, Nepal"}
API Params: {dest_id: "-1022488", arrival_date: "2025-11-20", ...}
===================
```

#### 2. API Call Progress
```
Transform Effect - Loading: true
Still loading, skipping...
```

#### 3. API Success
```
✅ API SUCCESS! Found hotels: 20
First hotel sample: {hotel_id: 13647198, property: {...}}
```

#### 4. Data Transformation
```
Hotel 1: Temple Bell Boutique Hotel & Spa Image: https://cf.bstatic.com/xdata/images/hotel/square500/735074254.jpg
Hotel 2: Hotel Fewa Camp Image: https://cf.bstatic.com/xdata/images/hotel/square500/492982109.jpg
...
✅ Set hotels to state: 20 hotels
Sample hotel data: {id: 13647198, name: "Temple Bell Boutique Hotel & Spa", ...}
```

#### 5. Render
```
🔄 RENDER - Hotels: 20 Loading: false Fallback: false
🎨 RENDERING HOTELS: 20 hotels
First 3 hotels: [{name: "Temple Bell...", image: "https://..."}, ...]
```

## 🎯 What Each Log Means

### ✅ Success Indicators

| Log Message | Meaning |
|-------------|---------|
| `API SUCCESS! Found hotels: 20` | API returned hotel data successfully |
| `Set hotels to state: 20 hotels` | Hotels were added to React state |
| `RENDERING HOTELS: 20 hotels` | Hotels are being rendered to the page |
| `Found 20 real hotels in Kathmandu!` | Toast notification confirming success |

### ❌ Error Indicators

| Log Message | Meaning | Solution |
|-------------|---------|----------|
| `Using fallback data because: no API data` | API didn't return data | Check API subscription |
| `You are not subscribed to this API` | Not subscribed to Booking.com v15 API | Subscribe at RapidAPI |
| `Invalid value` for dates | Dates are in wrong format | Check date formatting |
| `API response doesn't match expected structure` | API returned unexpected format | Check API response structure |
| `RENDER - Hotels: 0` | No hotels in state | Check why hotels weren't set |

## 🐛 Common Issues & Solutions

### Issue 1: "20 Hotels Found" but No Cards Display

**Symptoms:**
- Header shows "20 Hotels Found in Kathmandu"
- But hotel cards area is empty
- Console shows: `RENDER - Hotels: 0`

**Causes:**
1. Hotels state is being cleared after being set
2. Transform effect running multiple times
3. Render happening before state update

**Debug Steps:**
1. Check if you see `✅ Set hotels to state: 20 hotels`
2. Then check if you see `🔄 RENDER - Hotels: 0`
3. If hotels count drops from 20 to 0, there's a state clearing issue

**Solution:**
```javascript
// Look for patterns like this in console:
✅ Set hotels to state: 20 hotels  // ✓ Good
🔄 RENDER - Hotels: 20              // ✓ Good
🎨 RENDERING HOTELS: 20 hotels      // ✓ Good - Cards should show!

// vs

✅ Set hotels to state: 20 hotels  // ✓ Good
Transform Effect Triggered         // ⚠️ Effect ran again
Using fallback data                // ❌ Bad - cleared hotels
🔄 RENDER - Hotels: 6              // ❌ Showing demo data instead
```

### Issue 2: Images Not Loading

**Symptoms:**
- Hotel cards show but no images
- Broken image icons

**Debug:**
1. Check console for image URLs:
```
Hotel 1: Temple Bell... Image: https://cf.bstatic.com/...jpg
```
2. Copy the URL and paste in browser
3. If URL loads in browser but not in app, it's a CORS or SSL issue
4. If URL doesn't load anywhere, API is returning invalid URLs

**Solution:**
- Images should load from `cf.bstatic.com` (Booking.com CDN)
- If they don't, check Network tab for failed requests
- Check if image URLs are HTTPS (not HTTP)

### Issue 3: API Called Before Search Click

**Symptoms:**
- API is called while typing location
- Data loads before clicking Search button
- Wrong results shown

**Debug:**
```
// Check when API is called:
=== Hotels Debug ===
Selected Location: {dest_id: "-1022488"}  // ⚠️ Too early
API Params: {dest_id: "-1022488", arrival_date: null}  // ❌ No dates!
```

**Solution:**
- API should only be called when:
  - `selectedLocation` exists
  - `arrival_date` and `departure_date` are set
  - User clicked Search button

### Issue 4: Demo Data Instead of Real Data

**Symptoms:**
- Always shows "⚠️ Demo Mode" banner
- Same 6 demo hotels every time
- Console shows: `Using fallback data`

**Causes:**
1. Not subscribed to API
2. API call failed
3. API returned error

**Debug:**
```
// Check API response:
API Data: {status: false, message: "You are not subscribed"}
// Solution: Subscribe to Booking.com v15 API

// OR
API Data: null
Error: "Network error"
// Solution: Check internet connection, API key
```

## 📊 Expected Console Output (Success)

Here's what a successful search should look like:

```
=== Hotels Debug ===
Selected Location: {dest_id: "-1022488", search_type: "city", label: "Pokhara, Nepal", ...}
API Params: {
  dest_id: "-1022488",
  search_type: "CITY",
  arrival_date: "2025-11-20",
  departure_date: "2025-11-23",
  adults: 2,
  room_qty: 1,
  ...
}
API Data: {status: true, message: "Success", data: {hotels: [...]}}
Loading: false
Error: null
===================

=== Transform Effect Triggered ===
Loading: false
Error: null
API Data exists: true
API Data: {status: true, message: "Success", ...}

✅ API SUCCESS! Found hotels: 20
First hotel sample: {hotel_id: 13647198, property: {...}}

Hotel 1: Temple Bell Boutique Hotel & Spa Image: https://cf.bstatic.com/...jpg
Hotel 2: Hotel Fewa Camp Image: https://cf.bstatic.com/...jpg
[...18 more hotels...]

✅ Set hotels to state: 20 hotels
Sample hotel data: {
  id: 13647198,
  name: "Temple Bell Boutique Hotel & Spa",
  location: "Pokhara",
  image: "https://cf.bstatic.com/xdata/images/hotel/square500/735074254.jpg",
  rating: 9.4,
  reviews: 56,
  price: 425,
  currency: "USD",
  ...
}

🔄 RENDER - Hotels: 20 Loading: false Fallback: false

🎨 RENDERING HOTELS: 20 hotels
First 3 hotels: [
  {name: "Temple Bell Boutique Hotel & Spa", image: "https://cf.bstatic.com/...jpg"},
  {name: "Hotel Fewa Camp", image: "https://cf.bstatic.com/...jpg"},
  {name: "Bar Peepal Resort", image: "https://cf.bstatic.com/...jpg"}
]

✓ Toast: "Found 20 real hotels in Pokhara!"
```

## 🔧 Quick Fixes

### Fix 1: Clear Browser Cache
```bash
# Chrome/Edge
Ctrl + Shift + Delete → Clear cache

# Or hard reload
Ctrl + Shift + R
```

### Fix 2: Restart Dev Server
```bash
# Kill the server
Ctrl + C

# Restart
npm run dev
```

### Fix 3: Check API Subscription
1. Go to: https://rapidapi.com/DataCrawler/api/booking-com15
2. Check if you're subscribed (should show "Unsubscribe" button)
3. If not, click "Subscribe to Test" → Select free/basic plan

### Fix 4: Verify API Key
```bash
# Check .env file
cat .env | grep RAPIDAPI_KEY

# Should show:
VITE_RAPIDAPI_KEY=65a2fb9890msh2f1b3891422bcdap10b421jsndd0c715b3f03
```

## 📸 Screenshots to Share

If hotels still don't show, please share:

1. **Console tab** - All the logs (scroll up to see everything)
2. **Network tab** - Filter by "booking-com15" to see API calls
3. **React DevTools** - Hotels component state (if you have it installed)

## 🎯 Next Steps

After checking console logs:

1. If you see `✅ Set hotels to state: 20 hotels` → Hotels are loading successfully
2. If you see `🎨 RENDERING HOTELS: 20 hotels` → Cards should be visible
3. If cards still don't show → Check browser console for React errors
4. If you see red errors in console → Share them for debugging

## 📚 Useful Console Commands

While on /hotels page, try these in console:

```javascript
// Check hotels state (open React DevTools)
// Find Hotels component → Props/State → hotels array

// Or add this to console:
console.table(hotels);  // If hotels variable is accessible

// Check if images load
document.querySelectorAll('.hotel-card-image').forEach((img, i) => {
  console.log(`Image ${i + 1}:`, img.src, img.complete ? '✓ Loaded' : '✗ Failed');
});
```

---

**Remember:** The key is to look at the console output step by step. Each log tells you what's happening at that moment!
