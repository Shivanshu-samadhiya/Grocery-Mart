import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const activePath = location.pathname;

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/admin/products', name: 'Manage Products', icon: 'bi-box-seam' },
    { path: '/admin/users', name: 'Manage Users', icon: 'bi-people' },
    { path: '/admin/orders', name: 'Manage Orders', icon: 'bi-receipt' },
    { path: '/admin/payments', name: 'Payments Audit', icon: 'bi-credit-card' }
  ];

  return (
    <div className="admin-sidebar d-flex flex-column h-100 min-vh-100 text-dark bg-white">
      {/* Header Logo */}
      <div className="admin-sidebar-header">
        <Link className="d-flex align-items-center text-decoration-none" to="/">
          <img 
            src={logo} 
            alt="GroceryMart Logo" 
            height="32" 
            className="d-inline-block align-top me-2 rounded" 
          />
          <span className="fw-extrabold text-success fs-5" style={{ letterSpacing: '-0.5px' }}>
            GM <span className="text-warning">Admin</span>
          </span>
        </Link>
      </div>

      {/* Menu links list */}
      <ul className="admin-menu flex-grow-1">
        {menuItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <li key={item.path} className={`admin-menu-item ${isActive ? 'active' : ''}`}>
              <Link to={item.path}>
                <i className={`bi ${item.icon}`}></i>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer / Back to store */}
      <div className="p-3 border-top bg-light mt-auto">
        <div className="small text-muted mb-2">Logged in as:</div>
        <div className="fw-semibold text-truncate small mb-3">{user?.username}</div>
        <Link to="/" className="btn btn-outline-success btn-sm w-100 py-2 fw-semibold rounded-3">
          <i className="bi bi-shop me-1"></i> Back to Store
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
