import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-5 py-5 text-dark">
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand and Description */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <img 
                src={logo} 
                alt="GroceryMart Logo" 
                height="32" 
                className="d-inline-block align-top me-2 rounded" 
              />
              <span className="fw-extrabold fs-5" style={{ letterSpacing: '-0.5px' }}>
                <span className="text-success">Grocery</span><span className="text-warning">Mart</span>
              </span>
            </div>
            <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
              Experience superfast grocery deliveries at your doorstep in under 15 minutes. We source fresh fruits, vegetables, dairy, and household essentials directly to guarantee premium quality.
            </p>
            <div className="d-flex gap-3 text-primary">
              <a href="#" className="text-primary"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#" className="text-primary"><i className="bi bi-twitter-x fs-5"></i></a>
              <a href="#" className="text-primary"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#" className="text-primary"><i className="bi bi-linkedin fs-5"></i></a>
            </div>
          </div>

          {/* Useful categories quicklinks */}
          <div className="col-md-3 col-sm-6">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--gm-primary)' }}>
              Categories
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/?category=FRUITS_AND_VEGETABLES" className="text-muted text-decoration-none hover-link">Vegetables & Fruits</Link></li>
              <li><Link to="/?category=DAIRY_AND_EGGS" className="text-muted text-decoration-none hover-link">Dairy & Breakfast</Link></li>
              <li><Link to="/?category=BEVERAGES" className="text-muted text-decoration-none hover-link">Cold Drinks & Beverages</Link></li>
              <li><Link to="/?category=SNACKS" className="text-muted text-decoration-none hover-link">Munchies & Snacks</Link></li>
              <li><Link to="/?category=BAKERY" className="text-muted text-decoration-none hover-link">Bakery & Breads</Link></li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="col-md-3 col-sm-6">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--gm-primary)' }}>
              Customer Support
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/profile" className="text-muted text-decoration-none hover-link">My Account</Link></li>
              <li><Link to="/my-orders" className="text-muted text-decoration-none hover-link">Track Orders</Link></li>
              <li><Link to="/support?tab=terms" className="text-muted text-decoration-none hover-link">Terms & Conditions</Link></li>
              <li><Link to="/support?tab=privacy" className="text-muted text-decoration-none hover-link">Privacy Policy</Link></li>
              <li><Link to="/support?tab=faq" className="text-muted text-decoration-none hover-link">FAQ & Help Desk</Link></li>
            </ul>
          </div>

          {/* Secure Payment details */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--gm-primary)' }}>
              Secure Shopping
            </h6>
            <p className="text-muted small mb-3">
              Payments are processed securely via <strong>Razorpay</strong>.
            </p>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="badge bg-light text-dark border p-2"><i className="bi bi-shield-check text-primary me-1"></i>Secure SSL</span>
              <span className="badge bg-light text-dark border p-2">UPI / Cards</span>
            </div>
          </div>
        </div>

        <hr className="my-4 text-muted" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <span className="text-muted small">
            © 2026 GroceryMart . All rights reserved.
          </span>
          <span className="text-muted small d-flex align-items-center gap-2">
            Made with <i className="bi bi-heart-fill text-danger"></i> in India
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
