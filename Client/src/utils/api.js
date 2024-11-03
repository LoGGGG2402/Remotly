import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Add this line to enable cookies
});

// Add a request interceptor to include the token in the header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const logout = () => api.post('/auth/logout');
export const createAccount = (name, email, password, role) => api.post('/auth/create-account', { name, email, password, role });

export const getNumberOfRooms = () => api.get('/room/amount');
export const getAllRooms = () => api.get('/room/all');
export const getComputersInRoom = (roomId) => api.get(`/room/${roomId}`);
export const manageRoom = (roomId, name, description) => api.post(`/room/manage/${roomId}`, { name, description });
export const addUserToRoom = (roomId, userId) => api.post(`/room/${roomId}/addUser`, { userId });
export const removeUserFromRoom = (roomId, userId) => api.post(`/room/${roomId}/removeUser`, { userId });
export const addMultipleComputersToRoom = (roomId, computerIds) => api.post(`/room/${roomId}/addComputers`, { computerIds });

export const getNumberOfComputers = () => api.get('/computer/amount');
export const getAllComputers = () => api.get('/computer/all');
export const addComputerToRoom = (computerId, roomId) => api.post(`/computer/${computerId}/room/add`, { roomId });
export const changeComputerRoom = (computerId, roomId) => api.post(`/computer/${computerId}/room/change`, { roomId });
export const removeComputerFromRoom = (computerId) => api.post(`/computer/${computerId}/room/remove`);
export const getComputerProcesses = (computerId) => api.get(`/computer/${computerId}/processes`);
export const getComputerNetwork = (computerId) => api.get(`/computer/${computerId}/network`);

export const getAllUsers = () => api.get('/user/all');
export const createUser = (userData) => api.post('/user/create', userData);
export const createRoom = (roomData) => api.post('/room', roomData);
export default api;