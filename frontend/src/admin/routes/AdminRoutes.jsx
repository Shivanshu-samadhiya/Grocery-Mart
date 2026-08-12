import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../dashboard/AdminDashboard';
import ManageProducts from '../products/ManageProducts';
import ManageOrders from '../orders/ManageOrders';
import ManageUsers from '../users/ManageUsers';
import ManagePayments from '../payments/ManagePayments';
import AdminProfile from '../profile/AdminProfile';
import DeliveryPartners from '../delivery/DeliveryPartners';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Secure Admin Layout Console Shell */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<ManageProducts />} />
        <Route path="/orders" element={<ManageOrders />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/payments" element={<ManagePayments />} />
        <Route path="/delivery-partners" element={<DeliveryPartners />} />
        <Route path="/profile" element={<AdminProfile />} />
        
        {/* Default Redirect to Dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Catch-all redirect back to global login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
