import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from storage on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('Acadia_user');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — but NOT on auth routes or doc-access re-auth
// (doc-access uses 401 for wrong password but the admin is still authenticated)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthRoute = url.includes('/auth/');
    const isDocAccess = url.includes('/doc-access');
    if (err.response?.status === 401 && !isAuthRoute && !isDocAccess) {
      localStorage.removeItem('Acadia_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
