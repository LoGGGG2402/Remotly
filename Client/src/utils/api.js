import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const { token } = data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  createAccount: (name, email, password, role) => 
    api.post('/auth/create-account', { name, email, password, role }),
  refresh: () => api.post('/auth/refresh')
};

// Room endpoints
export const rooms = {
  getAll: () => api.get('/room/all'),
  getCount: () => api.get('/room/amount'),
  create: (roomData) => api.post('/room', roomData),
  delete: (id) => api.delete(`/room/${id}`),
  manage: (id, name, description) => 
    api.post(`/room/manage/${id}`, { name, description }),
  
  // Room users
  getUsers: (id) => api.get(`/room/${id}/users`),
  addUser: (roomId, userId, permission) => 
    api.post(`/room/${roomId}/addUser`, { userId, permission }),
  removeUser: (roomId, userId) => 
    api.post(`/room/${roomId}/removeUser`, { userId }),
  
  // Room computers
  getComputers: (roomId) => api.get(`/room/${roomId}`),
  addComputers: (roomId, computerIds) => 
    api.post(`/room/${roomId}/addComputers`, { computerIds })
};

// Computer endpoints
export const computers = {
  getAll: () => api.get('/computer/all'),
  getCount: () => api.get('/computer/amount'),
  
  // Computer room management
  addToRoom: (computerId, roomId) => 
    api.post(`/computer/${computerId}/room/add`, { roomId }),
  removeFromRoom: (computerId) => 
    api.post(`/computer/${computerId}/room/remove`),
  changeRoom: (computerId, roomId) => 
    api.post(`/computer/${computerId}/room/change`, { roomId }),
    
  // Computer monitoring
  getProcesses: (computerId) => 
    api.get(`/computer/${computerId}/processes`),
  getNetwork: (computerId) => 
    api.get(`/computer/${computerId}/network`)
};

// User endpoints
export const users = {
  getAll: () => api.get('/user/all'),
  getCount: () => api.get('/user/amount'),
  create: (userData) => api.post('/user/create', userData),
  delete: (id) => api.delete(`/user/${id}`)
};

export default api;