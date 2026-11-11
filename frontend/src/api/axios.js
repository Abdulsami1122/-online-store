import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
let calculatedBaseURL = '/api';

if (rawApiUrl && typeof rawApiUrl === 'string' && rawApiUrl.trim() !== '') {
  const cleanUrl = rawApiUrl.trim().replace(/\/$/, '');
  calculatedBaseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const API = axios.create({
  baseURL: calculatedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT auth token
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Error parsing token from storage:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
