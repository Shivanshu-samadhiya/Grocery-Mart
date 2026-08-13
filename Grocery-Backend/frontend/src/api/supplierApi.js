import axiosInstance from './axiosInstance';

// All calls here hit the real GroceryMart backend endpoints that are
// already scoped to the logged-in supplier (via the JWT), reusing the
// same /api/products and /api/orders resources the rest of the app uses.
export const supplierApi = {
  // GET /api/supplier/dashboard -> totals, low stock, pending orders, revenue
  getDashboard: async () => {
    const res = await axiosInstance.get('/supplier/dashboard');
    return res.data;
  },

  // GET /api/products/my-products -> only this supplier's own products
  getMyProducts: async () => {
    const res = await axiosInstance.get('/products/my-products');
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
  },

  // GET /api/orders/supplier-orders -> orders containing this supplier's products
  getSupplierOrders: async () => {
    const res = await axiosInstance.get('/orders/supplier-orders');
    return res.data;
  }
};
