import axiosInstance from './axiosInstance';

export const paymentService = {
  getAllPayments: async () => {
    const res = await axiosInstance.get('/payments');
    return res.data;
  }
};
