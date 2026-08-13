import axiosInstance from './axiosInstance';

export const userService = {
  getAllUsers: async () => {
    const res = await axiosInstance.get('/users');
    return res.data;
  },

  deleteUser: async (userId) => {
    const res = await axiosInstance.delete(`/users/${userId}`);
    return res.data;
  }
};
