// filepath: mobile/services/api.js
import axios from 'axios';
import { getSecureItem, setSecureItem, deleteSecureItem } from './secureStore';

// Point to backend API server (use standard emulator IP 10.0.2.2 for Android or localhost for iOS)
const BASE_URL = 'http://10.0.2.2:5000/v1'; 

const mobileApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Load token securely from hardware-backed iOS Keychain / Android Keystore
mobileApi.interceptors.request.use(
  async (config) => {
    const accessToken = await getSecureItem('accessToken');
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Refresh tokens and retry request on 401 Unauthorized
mobileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error('🌐 Mobile Network Error: Connect failed.');
      return Promise.reject(new Error('Network error. Check server connectivity.'));
    }

    const { status } = error.response;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 Mobile token expired. Retrieving refresh token from secure storage...');

      try {
        const refreshToken = await getSecureItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        // Call token refresh route (passing refresh token in body to bypass cookie dependency on mobile)
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken, newRefreshToken } = refreshResponse.data;

        // Save new credentials securely
        await setSecureItem('accessToken', accessToken);
        if (newRefreshToken) {
          await setSecureItem('refreshToken', newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return mobileApi(originalRequest);
      } catch (refreshError) {
        console.warn('❌ Session validation failed. Wiping credentials...');
        await deleteSecureItem('accessToken');
        await deleteSecureItem('refreshToken');
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(error);
  }
);

export default mobileApi;
