import api from './api';

export const attendanceService = {
  /**
   * POST /attendance/check-in
   */
  checkIn: async (data = {}) => {
    const response = await api.post('/attendance/check-in', data);
    return response.data;
  },

  /**
   * POST /attendance/check-out
   */
  checkOut: async (data = {}) => {
    const response = await api.post('/attendance/check-out', data);
    return response.data;
  },

  /**
   * GET /attendance/me
   */
  getMyAttendance: async (params = {}) => {
    const response = await api.get('/attendance/me', { params });
    return response.data;
  },

  /**
   * GET /attendance (Admin / HR)
   */
  getAllAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  /**
   * PUT /attendance/:attendanceId (Admin / HR)
   */
  updateAttendance: async (attendanceId, data) => {
    const response = await api.put(`/attendance/${attendanceId}`, data);
    return response.data;
  },
};

export default attendanceService;
