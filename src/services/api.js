import axios from 'axios';
import { store } from '../store';
import { updateAccessToken, clearAuth } from '../store/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

// Create Axios client pointing to our backend API
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach the current Access Token to Authorization header
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Automatically handle token refresh rotation on 401 Expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Explicit error states logging/handling
    if (!error.response) {
      console.error('🌐 Network Error: Cannot connect to the server.');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    const { status, data } = error.response;

    // Handle 429 (Rate Limit)
    if (status === 429) {
      console.warn('⚠️ Rate limit exceeded. Too many requests.');
      return Promise.reject(new Error('Too many requests. Please slow down.'));
    }

    // Handle 500 (Internal Server Error)
    if (status >= 500) {
      console.error(`💥 Server Error (${status}):`, data?.error || 'Unknown error');
      return Promise.reject(new Error(data?.error || 'A server error occurred.'));
    }

    // Handle 403 (Forbidden / Unverified email)
    if (status === 403) {
      console.warn('🚫 Forbidden request:', data?.error || 'Access denied.');
      // Pass through the original error so callers can inspect data (e.g., requiresVerification)
      return Promise.reject(error);
    }

    // Handle 401 (Unauthorized / Expired Access Token)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 Access token expired. Attempting token rotation...');
      
      try {
        // Attempt to rotate refresh token (HttpOnly cookie will be sent automatically)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = refreshResponse.data;
        
        // Save new token in Redux store
        store.dispatch(updateAccessToken(accessToken));
        
        // Update request headers and retry original API request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('❌ Session expired or refresh token invalid. Signing out...');
        store.dispatch(clearAuth());
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
