import api from './api';
import { store } from '../store';
import { authStart, authSuccess, authFailure, clearAuth } from '../store/authSlice';

// 1. User Registration
export async function registerUser(email, password, name) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  store.dispatch(authStart());
  try {
    const response = await api.post('/auth/register', { email, password, name });
    store.dispatch(authFailure(null)); // clear any previous error
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || err.message;
    store.dispatch(authFailure(errMsg));
    throw new Error(errMsg);
  }
}

// 1.5. Verify OTP
export async function verifyOtp(email, otp) {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || err.message;
    throw new Error(errMsg);
  }
}

// 1.6. Resend OTP
export async function resendOtp(email) {
  try {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || err.message;
    throw new Error(errMsg);
  }
}

// 2. User Login
export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  store.dispatch(authStart());
  try {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    
    // Dispatch success to Redux
    store.dispatch(authSuccess({ accessToken, user }));
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || err.message;
    store.dispatch(authFailure(errMsg));
    const errorObj = new Error(errMsg);
    if (err.response?.data?.requiresVerification) {
      errorObj.requiresVerification = true;
      errorObj.email = err.response.data.email;
    }
    throw errorObj;
  }
}

// 3. User Logout
export async function logoutUser() {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err.message);
  } finally {
    // Always clear local state even if api call fails
    store.dispatch(clearAuth());
  }
}

// 4. Logout All Sessions
export async function logoutAllUser() {
  try {
    await api.post('/auth/logout-all');
  } catch (err) {
    console.error('Logout all error:', err.message);
  } finally {
    store.dispatch(clearAuth());
  }
}

// 5. Trigger Movie Sync
export async function startMovieSync() {
  try {
    const response = await api.post('/sync/start');
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 6. Stop/Interrupt Movie Sync
export async function stopMovieSync() {
  try {
    const response = await api.post('/sync/stop');
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 7. Get Movie Sync Status
export async function getMovieSyncStatus() {
  try {
    const response = await api.get('/sync/status');
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 8. Fetch Synced Movies from DB
export async function getMovies(type, limit = 50, offset = 0) {
  try {
    const response = await api.get('/sync/movies', {
      params: { type, limit, offset }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 9. Get TMDB API Key Configuration
export async function getTmdbKeyConfig() {
  try {
    const response = await api.get('/sync/config');
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 10. Save TMDB API Key Configuration
export async function saveTmdbKeyConfig(apiKey) {
  try {
    const response = await api.post('/sync/config', { apiKey });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 11. Create Razorpay Payment Order
export async function createPaymentOrder() {
  try {
    const response = await api.post('/payment/create-order');
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 12. Verify Razorpay Payment Signature
export async function verifyPayment(razorpayData) {
  try {
    const response = await api.post('/payment/verify', razorpayData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

// 13. Verify Direct UPI Payment by UTR
export async function verifyUpiPayment(utr) {
  try {
    const response = await api.post('/payment/verify-upi', { utr });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}
