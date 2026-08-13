import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // No active token/user -> Redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role verification
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin attempts to access user page, route to admin home
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // If Delivery Partner attempts to access page, route to delivery dashboard
    if (user.role === 'DELIVERY') {
      return <Navigate to="/delivery/dashboard" replace />;
    }
    // If Supplier attempts to access page, route to supplier dashboard
    if (user.role === 'SUPPLIER') {
      return <Navigate to="/supplier/dashboard" replace />;
    }
    // Else route back to home catalog
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
