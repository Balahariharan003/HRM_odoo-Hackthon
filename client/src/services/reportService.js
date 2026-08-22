import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/payroll', '/reports')
  : 'http://localhost:5000/api/reports';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  // Fallback to HR001 seed user ID for admin/HR level access testing
  const userId = localStorage.getItem('userId') || '7e29d9bb-2d92-4eab-9d62-073290e96730';
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'x-user-id': userId,
    },
  };
};

export const getAttendanceReport = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/attendance`, {
    ...getAuthHeaders(),
    params,
    responseType: params.format === 'csv' ? 'blob' : 'json',
  });
  return response.data;
};

export const getLeaveReport = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/leave`, {
    ...getAuthHeaders(),
    params,
    responseType: params.format === 'csv' ? 'blob' : 'json',
  });
  return response.data;
};

export const getPayrollReport = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/payroll`, {
    ...getAuthHeaders(),
    params,
    responseType: params.format === 'csv' ? 'blob' : 'json',
  });
  return response.data;
};

export const getDashboardAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard`, getAuthHeaders());
  return response.data;
};

export default {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getDashboardAnalytics,
};
