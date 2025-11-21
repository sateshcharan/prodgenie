import axios from 'axios';

import { useLoadingStore, useWorkspaceStore } from '@prodgenie/libs/store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use((config) => {
  // Add workspace id
  const { activeWorkspace } = useWorkspaceStore.getState();
  if (activeWorkspace) {
    config.headers['active-workspace-id'] = activeWorkspace.id;

    // append query param instead of header
    // config.params = {
    //   ...(config.params || {}),
    //   workspaceId: activeWorkspace.id,
    // };
  }

  useLoadingStore.getState().startLoading(); // Trigger loading state
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
