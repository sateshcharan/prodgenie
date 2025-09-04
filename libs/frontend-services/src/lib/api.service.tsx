import axios from 'axios';

import { useLoadingStore, useWorkspaceStore } from '@prodgenie/libs/store';

const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDev ? 'http://localhost:3000' : import.meta.env.VITE_API_URL,
  withCredentials: true, // 👈 important: send cookies
});

// Add request interceptor
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  // Add workspace id
  const { activeWorkspace } = useWorkspaceStore.getState();
  if (activeWorkspace) {
    config.headers['active-workspace-id'] = activeWorkspace.id;
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
      // localStorage.removeItem('token');
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);

export default api;
