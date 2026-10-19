import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = async (params = {}) => {
  const { data } = await axios.get(`${API}/notifications/`, {
    params,
    headers: getAuthHeaders(),
  });
  return data;
};

export const markRead = async (id: string) => {
  const { data } = await axios.patch(`${API}/notifications/${id}/read/`, {}, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const markAllRead = async () => {
  const { data } = await axios.post(`${API}/notifications/mark-all-read/`, {}, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const deleteNotification = async (id: string) => {
  const { data } = await axios.delete(`${API}/notifications/${id}/`, {
    headers: getAuthHeaders(),
  });
  return data;
};
