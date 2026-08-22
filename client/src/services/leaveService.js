import api from './api';

export const leaveService = {
  /**
   * POST /leave/apply
   */
  applyLeave: async (data) => {
    const response = await api.post('/leave/apply', data);
    return response.data;
  },

  /**
   * GET /leave/my-leaves
   */
  getMyLeaves: async (params = {}) => {
    const response = await api.get('/leave/my-leaves', { params });
    return response.data;
  },

  /**
   * GET /leave/requests (Admin / HR)
   */
  getAllLeaveRequests: async (params = {}) => {
    const response = await api.get('/leave/requests', { params });
    return response.data;
  },

  /**
   * PUT /leave/:leaveId/approve (Admin / HR)
   */
  approveLeave: async (leaveId, data) => {
    const response = await api.put(`/leave/${leaveId}/approve`, data);
    return response.data;
  },

  /**
   * DELETE /leave/:leaveId
   */
  cancelLeave: async (leaveId) => {
    const response = await api.delete(`/leave/${leaveId}`);
    return response.data;
  },
};

export default leaveService;
