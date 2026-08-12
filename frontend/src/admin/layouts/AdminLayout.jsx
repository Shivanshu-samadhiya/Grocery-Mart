import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Guard Check: if loading auth state, render loading spinner
  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h5 className="mt-3 fw-bold text-success">Verifying Operator Credentials...</h5>
      </div>
    );
  }

  // Guard Check: if not logged in at all, redirect to the normal login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Guard Check: if logged in but not an administrator, redirect to customer home
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-shell">
      {/* Sidebar navigation */}
      <Sidebar 
        showMobile={showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />

      {/* Backdrop overlay for mobile drawer */}
      {showMobileSidebar && (
        <div 
          className="position-fixed top-0 start-0 end-0 bottom-0 z-2 d-lg-none"
          onClick={() => setShowMobileSidebar(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        />
      )}

      {/* Main workspace panels */}
      <div className="admin-main">
        <Topbar 
          onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} 
          pageTitle="Admin Dashboard"
        />

        {/* Nested page viewports */}
        <div className="admin-viewport">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
