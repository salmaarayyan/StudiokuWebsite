import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const layananAPI = {
  getAll: () => api.get('/layanan'),
  getById: (id) => api.get(`/layanan/${id}`),
  create: (data) => api.post('/layanan', data),
  update: (id, data) => api.put(`/layanan/${id}`, data),
  delete: (id) => api.delete(`/layanan/${id}`),
};

export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/gallery/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const testimonialAPI = {
  getAll: () => api.get('/testimonials'),
  getById: (id) => api.get(`/testimonials/${id}`),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const availabilityAPI = {
  getAvailability: (date, packageType) => api.get(`/availability/${date}/${packageType}`),
};

export const adminBlockAPI = {
  getAll: () => api.get('/admin/blocks'),
  create: (data) => api.post('/admin/blocks', data),
  delete: (id) => api.delete(`/admin/blocks/${id}`),
};

export default api;