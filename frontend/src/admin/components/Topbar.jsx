import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Topbar = ({ onToggleSidebar, pageTitle = 'Console' }) => {
  const { user } = useAuth();

  return (
    <header className="admin-topbar">
      {/* Left: Mobile Toggle & Page context */}
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-light d-lg-none border rounded-3 p-2 shadow-none" 
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <h4 className="fw-bold m-0 text-dark d-none d-sm-block">{pageTitle}</h4>
      </div>

      {/* Right: Operator profile tag */}
      <div className="d-flex align-items-center gap-3">
        {/* Support indicator */}
        <Link to="/admin/profile" className="text-decoration-none text-muted d-none d-md-flex align-items-center gap-1.5 small">
          <i className="bi bi-shield-check text-success"></i>
          <span>Secure Console</span>
        </Link>
        <span className="text-muted d-none d-md-inline border-start ps-3">|</span>

        {/* Profile indicator */}
        <Link to="/admin/profile" className="text-decoration-none">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="d-none d-lg-block text-start">
              <div className="fw-bold text-dark small m-0" style={{ lineHeight: '1.2' }}>{user?.username || 'Admin Operator'}</div>
              <span className="text-muted text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px' }}>{user?.role}</span>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
