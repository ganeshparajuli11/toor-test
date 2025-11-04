# API Integration Guide

This guide shows you how to connect your signup page to your backend API.

## Quick Start (3 Steps)

### Step 1: Set Your API URL

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=https://your-backend-api.com
```

### Step 2: Backend API Requirements

Your backend should have a POST endpoint at `/api/v1/auth/signup` that:

**Accepts:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string"
}
```

**Returns on Success (200):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": "123",
    "email": "user@example.com",
    "token": "jwt-token-here"
  }
}
```

**Returns on Error (400/422):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Step 3: Test It!

1. Start your backend server
2. Start the React app: `npm run dev`
3. Fill out the signup form
4. Submit and check browser console for API calls

## Adding More Endpoints

Edit `src/config/api.js`:

```javascript
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

  // User
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',

  // Add your custom endpoints
  GET_HOTELS: '/hotels',
  BOOK_HOTEL: '/hotels/book',
  // ... etc
};
```

## Using Endpoints in Components

### Example 1: Basic POST Request

```javascript
import { API_ENDPOINTS, getApiUrl } from '../config/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const handleSubmit = async (data) => {
  try {
    const response = await axios.post(
      getApiUrl(API_ENDPOINTS.SIGNUP),
      data
    );

    toast.success('Success!');
    console.log(response.data);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error occurred');
  }
};
```

### Example 2: GET Request with Auth Token

```javascript
const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await axios.get(
      getApiUrl(API_ENDPOINTS.GET_PROFILE),
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```

### Example 3: PUT Request

```javascript
const updateProfile = async (userData) => {
  try {
    const response = await axios.put(
      getApiUrl(API_ENDPOINTS.UPDATE_PROFILE),
      userData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    toast.success('Profile updated!');
  } catch (error) {
    toast.error('Failed to update profile');
  }
};
```

## Social Authentication

### Facebook Login

1. Set up Facebook OAuth in your backend
2. Update the handler in `src/pages/SignUp.jsx`:

```javascript
const handleSocialLogin = async (provider) => {
  if (provider === 'Facebook') {
    window.location.href = getApiUrl(API_ENDPOINTS.FACEBOOK_AUTH);
  }
};
```

### Google Login

1. Set up Google OAuth in your backend
2. Update the handler similarly:

```javascript
const handleSocialLogin = async (provider) => {
  if (provider === 'Google') {
    window.location.href = getApiUrl(API_ENDPOINTS.GOOGLE_AUTH);
  }
};
```

## Advanced: Axios Interceptors

For automatic token handling and error management, create `src/config/axios.js`:

```javascript
import axios from 'axios';
import { API_CONFIG } from './api';

const axiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

Then use it:

```javascript
import axiosInstance from '../config/axios';

const response = await axiosInstance.post('/auth/signup', data);
```

## CORS Configuration

If you get CORS errors, your backend needs to allow requests:

### Express.js Example:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5174', // React dev server
  credentials: true
}));
```

### Production:
```javascript
app.use(cors({
  origin: 'https://your-production-domain.com',
  credentials: true
}));
```

## Environment Variables

Different environments:

**.env.development:**
```env
VITE_API_BASE_URL=http://localhost:3000
```

**.env.production:**
```env
VITE_API_BASE_URL=https://api.yourproduction.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Testing Without Backend

Use a mock service like [JSONPlaceholder](https://jsonplaceholder.typicode.com/) or [Mockoon](https://mockoon.com/):

```env
VITE_API_BASE_URL=https://jsonplaceholder.typicode.com
```

## Error Handling Best Practices

```javascript
const handleApiCall = async () => {
  try {
    const response = await axios.post(url, data);

    // Handle success
    toast.success('Success!');
    return response.data;

  } catch (error) {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      toast.error(error.response.data.message);
    } else if (error.request) {
      // Request made but no response
      toast.error('No response from server');
    } else {
      // Request setup error
      toast.error('Request failed');
    }

    console.error('API Error:', error);
  }
};
```

## Debugging

1. **Check Network Tab**: Open DevTools → Network → XHR
2. **Console Logs**: Check browser console for errors
3. **API Response**: Log the full response object
4. **CORS**: Check if CORS headers are present

## Common Issues

### Issue: API calls failing
**Solution**: Check `.env` file exists and `VITE_API_BASE_URL` is set

### Issue: CORS errors
**Solution**: Configure CORS in your backend

### Issue: 404 errors
**Solution**: Verify endpoint paths in `src/config/api.js` match your backend

### Issue: Token not sent
**Solution**: Add authorization header or use axios interceptors

## Need Help?

1. Check browser console for errors
2. Check network tab for API responses
3. Verify backend is running
4. Test API endpoints with Postman/Insomnia first

---

**That's it!** Your signup page is now ready to connect to any backend API. Just update the `.env` file with your API URL and you're good to go! 🚀
