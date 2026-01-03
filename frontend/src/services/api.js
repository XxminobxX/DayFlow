import axios from 'axios';
import { API_BASE_URL, USE_DEV_AUTH, DEV_FIREBASE_UID } from '../firebaseConfig';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add interceptor to include Firebase ID token in all requests
api.interceptors.request.use(async (config) => {
  try {
    // Get Firebase ID token from localStorage
    const token = localStorage.getItem('firebaseIdToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (USE_DEV_AUTH) {
      // Development mode: use X-Firebase-UID header instead
      config.headers['X-Firebase-UID'] = DEV_FIREBASE_UID;
    }
  } catch (error) {
    console.error('Error adding auth token:', error);
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('firebaseIdToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
