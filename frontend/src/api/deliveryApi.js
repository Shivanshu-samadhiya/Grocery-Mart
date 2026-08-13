import axiosInstance from './axiosInstance';

export const deliveryApi = {
  getDashboard: async () => {
    const res = await axiosInstance.get('/delivery/dashboard');
    return res.data;
  },

  getAssignedOrders: async () => {
    const res = await axiosInstance.get('/delivery/orders');
    return res.data;
  },

  acceptOrder: async (id) => {
    const res = await axiosInstance.put(`/delivery/orders/${id}/accept`);
    return res.data;
  },

  markPickedUp: async (id) => {
    const res = await axiosInstance.put(`/delivery/orders/${id}/picked-up`);
    return res.data;
  },

  markOutForDelivery: async (id) => {
    const res = await axiosInstance.put(`/delivery/orders/${id}/out-for-delivery`);
    return res.data;
  },

  markDelivered: async (id) => {
    const res = await axiosInstance.put(`/delivery/orders/${id}/delivered`);
    return res.data;
  },

  getHistory: async () => {
    const res = await axiosInstance.get('/delivery/history');
    return res.data;
  }
};
