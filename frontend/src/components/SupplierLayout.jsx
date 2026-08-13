import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import '../admin/styles/admin.css'; // Reuse the enterprise dashboard styling

const SupplierLayout = () => {
  const { user, loading, logout } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();
  const activePath = location.pathname;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h5 className="mt-3 fw-bold text-success">Verifying Session...</h5>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'SUPPLIER') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { path: '/supplier/dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/supplier/products', name: 'My Products', icon: 'bi-box-seam' },
    { path: '/supplier/orders', name: 'Orders', icon: 'bi-receipt' },
    { path: '/supplier/profile', name: 'Profile', icon: 'bi-person-gear' }
  ];

  const getPageTitle = () => {
    switch (activePath) {
      case '/supplier/dashboard': return 'Supplier Dashboard';
      case '/supplier/products': return 'My Products';
      case '/supplier/orders': return 'Orders With My Products';
      case '/supplier/profile': return 'My Profile';
      default: return 'Console';
    }
  };

  return (
    <div className="admin-shell">
      {/* Sidebar navigation */}
      <div className={`admin-sidebar ${showMobileSidebar ? 'show' : ''}`}>
        <div className="admin-sidebar-logo d-flex align-items-center justify-content-between">
          <Link className="d-flex align-items-center text-decoration-none" to="/supplier/dashboard">
            <img
              src={logo}
              alt="GroceryMart Logo"
              height="36"
              className="me-2 rounded-2"
            />
            <span className="fw-extrabold text-success fs-5" style={{ letterSpacing: '-0.5px' }}>
              🛒 Grocery<span className="text-warning">Mart</span> <span className="text-dark small fs-6">Supplier</span>
            </span>
          </Link>
          <button className="btn d-lg-none text-muted border-0 p-0" onClick={() => setShowMobileSidebar(false)}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <ul className="admin-sidebar-menu flex-grow-1">
          {menuItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <li key={item.path} className={`admin-sidebar-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path} className="admin-sidebar-link" onClick={() => setShowMobileSidebar(false)}>
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-3 border-top bg-light">
          <div className="small text-muted mb-1">Supplier:</div>
          <div className="fw-bold text-truncate small mb-3 text-dark">{user?.username || 'Supplier'}</div>
          <button
            className="btn btn-outline-danger btn-sm w-100 py-2 fw-semibold rounded-3"
            onClick={logout}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Logout Session
          </button>
        </div>
      </div>

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
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-lg-none border rounded-3 p-2 shadow-none"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <h4 className="fw-bold m-0 text-dark d-none d-sm-block">{getPageTitle()}</h4>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1.5 small text-muted">
              <i className="bi bi-shield-check text-success"></i>
              <span>Secure Console</span>
            </div>
            <span className="text-muted d-none d-md-inline border-start ps-3">|</span>

            <div className="d-flex align-items-center gap-2">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                {user?.username?.substring(0, 2).toUpperCase() || 'SP'}
              </div>
              <div className="d-none d-lg-block text-start">
                <div className="fw-bold text-dark small m-0" style={{ lineHeight: '1.2' }}>{user?.username || 'Supplier'}</div>
                <span className="text-muted text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px' }}>Supplier Partner</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-viewport">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SupplierLayout;
