import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ showMobile, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const activePath = location.pathname;

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/admin/products', name: 'Products', icon: 'bi-box-seam' },
    { path: '/admin/orders', name: 'Orders', icon: 'bi-receipt' },
    { path: '/admin/users', name: 'Users', icon: 'bi-people' },
    { path: '/admin/payments', name: 'Payments', icon: 'bi-credit-card' },
    { path: '/admin/delivery-partners', name: 'Delivery Partners', icon: 'bi-truck' },
    { path: '/admin/profile', name: 'Profile', icon: 'bi-person-gear' }
  ];

  return (
    <div className={`admin-sidebar ${showMobile ? 'show' : ''}`}>
      {/* Brand logo */}
      <div className="admin-sidebar-logo d-flex align-items-center justify-content-between">
        <Link className="d-flex align-items-center text-decoration-none" to="/admin/dashboard">
          <img 
            src={logo} 
            alt="GroceryMart Logo" 
            height="36" 
            className="me-2 rounded-2" 
          />
          <span className="fw-extrabold text-success fs-5" style={{ letterSpacing: '-0.5px' }}>
            🛒 Grocery<span className="text-warning">Mart</span> <span className="text-dark small fs-6">Admin</span>
          </span>
        </Link>
        {/* Close mobile button */}
        <button className="btn d-lg-none text-muted border-0 p-0" onClick={onClose}>
          <i className="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      {/* Menu list */}
      <ul className="admin-sidebar-menu flex-grow-1">
        {menuItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <li key={item.path} className={`admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <Link to={item.path} className="admin-sidebar-link" onClick={onClose}>
                <i className={`bi ${item.icon}`}></i>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer Operator Session Control */}
      <div className="p-3 border-top bg-light">
        <div className="small text-muted mb-1">Operator Profile:</div>
        <div className="fw-bold text-truncate small mb-3">{user?.username || 'Administrator'}</div>
        <button 
          className="btn btn-outline-danger btn-sm w-100 py-2 fw-semibold rounded-3"
          onClick={logout}
        >
          <i className="bi bi-box-arrow-right me-1"></i> Logout Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
