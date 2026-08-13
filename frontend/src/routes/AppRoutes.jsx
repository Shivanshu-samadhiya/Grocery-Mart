import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Import Pages
import Home from '../pages/Home';
import LoginRegister from '../pages/LoginRegister';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import MyOrders from '../pages/MyOrders';
import Profile from '../pages/Profile';
import Support from '../pages/Support';

// Import Admin Routes
import AdminRoutes from '../admin/routes/AdminRoutes';

// Import Delivery Routes
import DeliveryLayout from '../components/DeliveryLayout';
import DeliveryDashboard from '../pages/delivery/DeliveryDashboard';
import AssignedOrders from '../pages/delivery/AssignedOrders';
import DeliveryHistory from '../pages/delivery/DeliveryHistory';

// Import Supplier Routes
import SupplierLayout from '../components/SupplierLayout';
import SupplierDashboard from '../pages/supplier/SupplierDashboard';
import SupplierProducts from '../pages/supplier/SupplierProducts';
import SupplierOrders from '../pages/supplier/SupplierOrders';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/support" element={<Support />} />

      {/* Customer Pages (Protected) */}
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Checkout />
        </ProtectedRoute>
      } />
      <Route path="/order-success" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <OrderSuccess />
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <MyOrders />
        </ProtectedRoute>
      } />

      {/* General Protected Profile Page */}
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'DELIVERY', 'SUPPLIER']}>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Delivery Agent Portal subpaths */}
      <Route path="/delivery" element={
        <ProtectedRoute allowedRoles={['DELIVERY']}>
          <DeliveryLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<AssignedOrders />} />
        <Route path="history" element={<DeliveryHistory />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Supplier Portal subpaths */}
      <Route path="/supplier" element={
        <ProtectedRoute allowedRoles={['SUPPLIER']}>
          <SupplierLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<SupplierDashboard />} />
        <Route path="products" element={<SupplierProducts />} />
        <Route path="orders" element={<SupplierOrders />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Portal subpaths */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminRoutes />
        </ProtectedRoute>
      } />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
