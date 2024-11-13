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

// Auth endpoints
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  createAccount: (name, email, password, role) => 
    api.post('/auth/create-account', { name, email, password, role })
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