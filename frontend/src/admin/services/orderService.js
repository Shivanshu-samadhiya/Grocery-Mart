import axiosInstance from './axiosInstance';

export const orderService = {
  getAllOrders: async () => {
    const res = await axiosInstance.get('/orders');
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await axiosInstance.get(`/orders/${orderId}`);
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await axiosInstance.put(`/orders/${orderId}/status`, { status });
    return res.data;
  },

  cancelOrder: async (orderId) => {
    const res = await axiosInstance.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    const res = await axiosInstance.put('/orders/payment-status', { orderId, paymentStatus });
    return res.data;
  }
};
