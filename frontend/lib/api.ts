import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refresh_token,
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Only redirect if we're not on the login/signup pages
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data: { email: string; username: string; password: string; password2: string }) =>
    api.post('/users/register/', data),
  login: (username: string, password: string) =>
    api.post('/token/', { username, password }),
  getMe: () => api.get('/users/me/'),
};

// Category endpoints
export const categoryAPI = {
  list: async () => {
    const response = await api.get('/categories/');
    // Handle paginated response - extract results array
    return {
      data: response.data.results || response.data,
    };
  },
  create: (data: { name: string; color: string }) => api.post('/categories/', data),
  createDefaults: () => api.post('/categories/create_defaults/'),
  update: (id: number, data: { name?: string; color?: string }) =>
    api.patch(`/categories/${id}/`, data),
  delete: (id: number) => api.delete(`/categories/${id}/`),
};

// Note endpoints
export const noteAPI = {
  list: async (categoryId?: number) => {
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await api.get('/notes/', { params });
    // Handle paginated response - extract results array
    return {
      data: response.data.results || response.data,
    };
  },
  create: (data: { title?: string; content?: string; category?: number }) =>
    api.post('/notes/', data),
  quickCreate: () => api.post('/notes/quick_create/'),
  update: (id: number, data: { title?: string; content?: string; category?: number }) =>
    api.patch(`/notes/${id}/`, data),
  delete: (id: number) => api.delete(`/notes/${id}/`),
};
