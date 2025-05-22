import axios from 'axios';
import { useLoadingStore } from '@prodgenie/libs/store';

const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDev ? 'http://localhost:3000' : import.meta.env.VITE_API_URL,
});

// Add request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Trigger loading state
  const { startLoading } = useLoadingStore.getState();
  startLoading();

  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (res) => {
    const { stopLoading } = useLoadingStore.getState();
    stopLoading();
    return res;
  },
  (err) => {
    const { stopLoading } = useLoadingStore.getState();
    stopLoading();

    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);

export default api;
