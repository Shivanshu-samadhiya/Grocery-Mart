import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gm_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync profile when token is active
  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/users/profile');
      setUser(res.data);
      localStorage.setItem('gm_user', JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to load user profile", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }

    // Listener for interceptor-triggered logouts
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token: jwtToken } = response.data;
      
      localStorage.setItem('gm_token', jwtToken);
      setToken(jwtToken);
      
      // Fetch profile with new token immediately
      const profileResponse = await axiosInstance.get('/users/profile', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      
      setUser(profileResponse.data);
      localStorage.setItem('gm_user', JSON.stringify(profileResponse.data));
      
      return profileResponse.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  // Register handler
  const register = async (username, email, password, phone, address, role) => {
    try {
      const response = await axiosInstance.post('/users/register', {
        username,
        email,
        password,
        phone,
        address,
        role
      });
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  // Profile update handler
  const updateProfile = async (updatedData) => {
    if (!user) return;
    try {
      const response = await axiosInstance.put(`/users/${user.userId}`, updatedData);
      setUser(response.data);
      localStorage.setItem('gm_user', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('gm_token');
    localStorage.removeItem('gm_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    updateProfile,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isUser: user?.role === 'USER',
    isSupplier: user?.role === 'SUPPLIER'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
