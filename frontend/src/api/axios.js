import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7002',
  withCredentials: true,          // always send the auth cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response Interceptor ─────────────────────────────────────────────────────
// On 401 → redirect to login (session expired or not authenticated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop on the login page itself
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
