import axiosInstance from './axiosInstance';

export const adminService = {
  getDashboardStats: async () => {
    const res = await axiosInstance.get('/admin/dashboard');
    return res.data;
  },

  getDeliveryPartners: async () => {
    const res = await axiosInstance.get('/admin/delivery-partners');
    return res.data;
  },

  assignDeliveryPartner: async (orderId, partnerId) => {
    const res = await axiosInstance.put(`/admin/orders/${orderId}/assign`, {
      deliveryPartnerId: partnerId
    });
    return res.data;
  },

  createDeliveryPartner: async (partnerData) => {
    const res = await axiosInstance.post('/admin/delivery-partners', partnerData);
    return res.data;
  }
};
