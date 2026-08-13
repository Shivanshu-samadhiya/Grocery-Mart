import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  // Prevent direct URL entry without placing an order
  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
        <motion.div 
          className="card border-0 shadow-lg text-center p-4 p-md-5 bg-white" 
          style={{ maxWidth: '500px', width: '100%', borderRadius: '24px' }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated Green Circle */}
          <div className="d-flex justify-content-center mb-4">
            <div 
              className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '80px', height: '80px', fontSize: '3rem' }}
            >
              <i className="bi bi-patch-check-fill"></i>
            </div>
          </div>

          <h3 className="fw-bold mb-2">Order Confirmed!</h3>
          <p className="text-muted small px-3">
            Thank you for shopping with us! Your payment was verified successfully and your order has been placed.
          </p>

          <div className="bg-light p-3 my-4 rounded-3 border">
            <div className="text-muted small">ORDER NUMBER</div>
            <div className="fw-bold fs-5 text-dark">#GM-{orderId}</div>
          </div>

          <div className="d-flex flex-column gap-2 px-3">
            <Link 
              to="/my-orders" 
              className="btn btn-gm-primary py-2.5 fw-semibold shadow-sm"
              style={{ borderRadius: '10px', backgroundColor: 'var(--gm-primary)' }}
            >
              <i className="bi bi-clock-history me-1"></i> Track Order Status
            </Link>
            <Link 
              to="/" 
              className="btn btn-light border py-2.5 fw-semibold"
              style={{ borderRadius: '10px' }}
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
