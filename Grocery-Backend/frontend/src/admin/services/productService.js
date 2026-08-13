import axiosInstance from './axiosInstance';

export const productService = {
  getProducts: async (page = 0, size = 8, sortBy = 'productId', direction = 'desc') => {
    const res = await axiosInstance.get(`/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
    return res.data;
  },
  
  searchProducts: async (keyword) => {
    const res = await axiosInstance.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    return res.data;
  },

  getProductsByCategory: async (category) => {
    const res = await axiosInstance.get(`/products/category/${category}`);
    return res.data;
  },

  getProductById: async (productId) => {
    const res = await axiosInstance.get(`/products/${productId}`);
    return res.data;
  },

  addProduct: async (productData) => {
    const res = await axiosInstance.post('/products', productData);
    return res.data;
  },

  updateProduct: async (productId, productData) => {
    const res = await axiosInstance.put(`/products/${productId}`, productData);
    return res.data;
  },

  deleteProduct: async (productId) => {
    const res = await axiosInstance.delete(`/products/${productId}`);
    return res.data;
  }
};
