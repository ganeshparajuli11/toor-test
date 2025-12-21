import axios from 'axios';

// Create axios instance
// Use environment variable for API URL or default to relative path /api (for production)
// fallback to localhost:3001/api only during development if VITE_API_URL is not set
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Response interceptor for common error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unknown error occurred';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

export default api;
