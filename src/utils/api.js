import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://splits-backend.vercel.app'
});

// Function to set up axios interceptors
export const setupAxiosInterceptors = (onTokenExpired) => {
  // Request interceptor to add token to headers
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token is expired or invalid
        if (onTokenExpired) {
          onTokenExpired();
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
