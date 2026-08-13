import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user's cart from backend
  const fetchCart = async () => {
    if (!token || user?.role !== 'USER') {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error("Error fetching cart", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when login status or role shifts
  useEffect(() => {
    if (token && user?.role === 'USER') {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [token, user]);

  // Add Item to Cart
  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      toast.warning("Please login to add products to your cart!");
      return false;
    }
    if (user?.role !== 'USER') {
      toast.warning("Only customers can maintain a shopping cart!");
      return false;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.post('/cart', { productId, quantity });
      setCart(response.data);
      toast.success("Product added to cart!");
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to add product to cart";
      toast.error(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update Item Quantity
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
      return removeCartItem(cartItemId);
    }
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/cart/${cartItemId}`, { quantity });
      setCart(response.data);
      return true;
    } catch (err) {
      toast.error("Failed to update product quantity");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove Item from Cart
  const removeCartItem = async (cartItemId) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/cart/item/${cartItemId}`);
      // Reload cart structure to update totals
      await fetchCart();
      toast.success("Item removed from cart");
      return true;
    } catch (err) {
      toast.error("Failed to remove item");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire Cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete('/cart');
      setCart(null);
      return true;
    } catch (err) {
      toast.error("Failed to clear cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper utility: get active quantity of a product in the cart
  const getProductQuantity = (productId) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  // Helper utility: get cart item ID by product ID
  const getCartItemId = (productId) => {
    if (!cart || !cart.items) return null;
    const item = cart.items.find(i => i.productId === productId);
    return item ? item.cartItemId : null;
  };

  // Totals calculations
  const totalItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.totalAmount || 0;
  const gst = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
  const deliveryCharge = subtotal >= 550 || subtotal === 0 ? 0 : 40; // Free delivery above 550
  const grandTotal = parseFloat((subtotal + gst + deliveryCharge).toFixed(2));

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeCartItem,
    clearCart,
    getProductQuantity,
    getCartItemId,
    totalItemsCount,
    subtotal,
    gst,
    deliveryCharge,
    grandTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
