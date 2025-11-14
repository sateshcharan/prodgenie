import axios from 'axios';

import { useLoadingStore, useWorkspaceStore } from '@prodgenie/libs/store';

const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDev
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_DEP,
  withCredentials: true,
});

console.log(
  '[API BASE URL]',
  isDev,
  import.meta.env.VITE_API_URL_DEV,
  import.meta.env.VITE_API_URL_DEP
);
console.log('Final baseURL:', api.defaults.baseURL);

// Add request interceptor
api.interceptors.request.use((config) => {
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
      // window.location.href = '/';
    }

    return Promise.reject(err);
  }
);

export default api;
