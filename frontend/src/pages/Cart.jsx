import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Cart = () => {
  const { 
    cart, 
    loading, 
    updateQuantity, 
    removeCartItem, 
    clearCart,
    subtotal, 
    gst, 
    deliveryCharge, 
    grandTotal 
  } = useCart();

  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState({});

  // Fetch product metadata (images, units) for cart items
  useEffect(() => {
    const fetchCartProductInfo = async () => {
      if (!cart || !cart.items) return;
      
      const newInfo = { ...productInfo };
      let changed = false;

      for (const item of cart.items) {
        if (!newInfo[item.productId]) {
          try {
            const res = await axiosInstance.get(`/products/${item.productId}`);
            newInfo[item.productId] = res.data;
            changed = true;
          } catch (err) {
            console.error("Failed to load cart product detail", err);
          }
        }
      }

      if (changed) {
        setProductInfo(newInfo);
      }
    };

    fetchCartProductInfo();
  }, [cart]);

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      const success = await clearCart();
      if (success) toast.success("Cart cleared successfully");
    }
  };

  const handleProceed = () => {
    if (!cart || cart.items.length === 0) {
      toast.warning("Your cart is empty!");
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-5 flex-grow-1">
        <h3 className="fw-bold mb-4 text-dark d-flex align-items-center">
          <i className="bi bi-cart3 text-success me-2 fs-3"></i> Your Shopping Cart
        </h3>

        {loading && !cart ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted">Updating your cart...</p>
          </div>
        ) : cart && cart.items && cart.items.length > 0 ? (
          <div className="row g-4">
            {/* Cart Items List */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted fw-bold small">{cart.items.length} Items</span>
                  <button className="btn btn-link text-danger text-decoration-none small p-0" onClick={handleClearCart}>
                    <i className="bi bi-trash3 me-1"></i> Clear Cart
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {cart.items.map((item) => {
                    const info = productInfo[item.productId];
                    return (
                      <div key={item.cartItemId} className="row g-3 align-items-center pb-3 border-bottom border-light-subtle">
                        {/* Image */}
                        <div className="col-3 col-sm-2 text-center">
                          <img 
                            src={info?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60'} 
                            alt={item.productName} 
                            className="img-fluid rounded border" 
                            style={{ maxHeight: '70px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>

                        {/* Name and unit */}
                        <div className="col-9 col-sm-4">
                          <Link to={`/product/${item.productId}`} className="text-decoration-none text-dark">
                            <h6 className="fw-semibold mb-1 text-truncate">{item.productName}</h6>
                          </Link>
                          <span className="text-muted small">
                            {info?.description ? info.description.substring(0, 30) + '...' : 'Fresh quality'}
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="col-4 col-sm-3 d-flex justify-content-center">
                          <div className="quantity-selector d-flex align-items-center border rounded overflow-hidden" style={{ width: '80px', height: '32px' }}>
                            <button className="btn p-1 text-white border-0 shadow-none" style={{ backgroundColor: 'var(--gm-primary)', borderRadius: 0 }} onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>-</button>
                            <span className="flex-grow-1 text-center text-white fw-bold d-flex align-items-center justify-content-center" style={{ fontSize: '0.85rem', backgroundColor: 'var(--gm-primary)', height: '100%' }}>{item.quantity}</span>
                            <button className="btn p-1 text-white border-0 shadow-none" style={{ backgroundColor: 'var(--gm-primary)', borderRadius: 0 }} onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>+</button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-6 col-sm-2 text-end text-sm-center">
                          <span className="fw-bold text-dark fs-6">₹{item.subtotal}</span>
                          <div className="text-muted small">₹{item.price} each</div>
                        </div>

                        {/* Delete action */}
                        <div className="col-2 col-sm-1 text-end">
                          <button className="btn border-0 text-danger p-1" onClick={() => removeCartItem(item.cartItemId)}>
                            <i className="bi bi-x-circle fs-5"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price Summary Sidebar */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white position-sticky" style={{ top: '90px' }}>
                <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">Bill Details</h5>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Item Subtotal</span>
                  <span className="fw-semibold">₹{subtotal}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">GST (5%)</span>
                  <span className="fw-semibold">₹{gst}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success fw-bold">FREE</span>
                  ) : (
                    <span className="fw-semibold">₹{deliveryCharge}</span>
                  )}
                </div>

                {deliveryCharge > 0 && (
                  <div className="alert alert-warning py-2 small border-0 text-center mb-4" style={{ borderRadius: '8px' }}>
                    Add items worth <strong>₹{550 - subtotal}</strong> more for free delivery!
                  </div>
                )}

                <hr className="text-muted my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold fs-5 text-dark">Grand Total</span>
                  <span className="fw-extrabold fs-4 text-dark">₹{grandTotal}</span>
                </div>

                <button 
                  className="btn w-100 py-3 fw-bold shadow text-white border-0"
                  onClick={handleProceed}
                  style={{ 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    backgroundColor: '#2E7D32',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1b5e20'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
                >
                  Proceed to Checkout <i className="bi bi-arrow-right-short fs-5 ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3 fw-bold">Your Cart is Empty</h4>
            <p className="text-muted small">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/" className="btn btn-gm-primary px-4 mt-2" style={{ backgroundColor: 'var(--gm-primary)' }}>
              Shop Groceries Now
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
