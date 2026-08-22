import api from './api';

export const profileService = {
  getMyProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },
  getUserProfile: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },
  updateMyProfile: async (formData) => {
    const response = await api.put('/profile/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateUserProfile: async (userId, formData) => {
    const response = await api.put(`/profile/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
