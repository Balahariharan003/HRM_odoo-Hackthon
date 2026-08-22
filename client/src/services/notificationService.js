import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/payroll', '/notifications')
  : 'http://localhost:5000/api/notifications';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || '818721b4-52ce-4eb3-9676-d63fb921b210';
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'x-user-id': userId,
    },
  };
};

export const getNotifications = async (params = {}) => {
  const response = await axios.get(API_BASE_URL, {
    ...getAuthHeaders(),
    params,
  });
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await axios.put(`${API_BASE_URL}/${notificationId}/read`, {}, getAuthHeaders());
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.put(`${API_BASE_URL}/read-all`, {}, getAuthHeaders());
  return response.data;
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
