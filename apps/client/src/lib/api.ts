import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }
    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject(new Error(`API error ${error.response.status}`));
    }
    return Promise.reject(error);
  },
);
