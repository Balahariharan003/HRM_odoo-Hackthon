import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/payroll';

const getAuthHeaders = (isAdmin = false) => {
  const token = localStorage.getItem('token');
  const defaultUserId = isAdmin
    ? '7e29d9bb-2d92-4eab-9d62-073290e96730' // HR001 seed user ID
    : '818721b4-52ce-4eb3-9676-d63fb921b210'; // EMP001 seed user ID
  const userId = localStorage.getItem('userId') || defaultUserId;
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'x-user-id': userId,
    },
  };
};

export const getMyPayroll = async (month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await axios.get(`${API_BASE_URL}/me`, {
      ...getAuthHeaders(false),
      params,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const downloadPayslip = async (payrollId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payslip/${payrollId}`, getAuthHeaders(false));
    return response.data;
  } catch (error) {
    console.error('Error fetching payslip:', error);
    throw error;
  }
};

export const getAllPayroll = async (params) => {
  const response = await axios.get(API_BASE_URL, {
    ...getAuthHeaders(true),
    params,
  });
  return response.data;
};

export const processMonthlyPayroll = async (month, year) => {
  const response = await axios.post(`${API_BASE_URL}/process`, { month, year }, getAuthHeaders(true));
  return response.data;
};

export const updateSalaryStructure = async (employeeId, data) => {
  const response = await axios.put(`${API_BASE_URL}/${employeeId}`, data, getAuthHeaders(true));
  return response.data;
};

export default {
  getMyPayroll,
  downloadPayslip,
  getAllPayroll,
  processMonthlyPayroll,
  updateSalaryStructure,
};
