import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from storage on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('trophe_user');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — but NOT on auth routes (login/register handle their own errors)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('trophe_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
