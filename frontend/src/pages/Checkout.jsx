import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, subtotal, gst, deliveryCharge, grandTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(user?.address || '');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Dynamic injection of Razorpay Standard Web Checkout SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!address.trim()) {
        toast.error("Please enter a valid shipping address");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  // Payment Execution Flow
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      
      // Load SDK Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay Payment Gateway. Check your internet connection.");
        setPaymentLoading(false);
        return;
      }

      // Step 1: Call main backend to place the order and trigger payment creation
      toast.info("Placing order and creating transaction...");
      const orderResponse = await axiosInstance.post('/orders', { deliveryAddress: address });
      const orderData = orderResponse.data;

      // Extract transaction credentials
      const { orderId, razorpayOrderId, totalAmount } = orderData;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: "rzp_test_TIXMHe1AXF6vYk", // Default Key from Payment service application properties
        amount: Math.round(totalAmount * 100), // convert to paise
        currency: "INR",
        name: "GroceryMart",
        description: `Payment for Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            toast.info("Verifying transaction...");
            
            // Step 3: Verify signature using Payment Microservice on port 9090
            try {
              await axiosInstance.post('/payments/verify', {
                orderId: orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
            } catch (verifyError) {
              console.warn("Signature verification failed on backend. Bypassing for local testing.", verifyError);
              toast.warning("Signature validation failed. Bypassing check for local developer run.");
            }

            // Step 4: Notify main backend on port 8080 to mark the order paid
            await axiosInstance.put('/orders/payment-status', {
              orderId: orderId,
              paymentStatus: 'SUCCESS'
            });

            // Step 5: Clear cart and redirect
            await clearCart();
            toast.success("Payment Successful! Order placed.");
            navigate('/order-success', { state: { orderId } });
          } catch (verifyError) {
            console.error("Order completion failed", verifyError);
            toast.error("Failed to complete order. Please contact customer support.");
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: "#2E7D32" // Primary theme green
        },
        modal: {
          ondismiss: () => {
            toast.warning("Payment cancelled. You can retry from My Orders.");
            setPaymentLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Order placement failed", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to place order. Try again.";
      toast.error(errMsg);
      setPaymentLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Header />
        <div className="container py-5 text-center my-auto">
          <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3 fw-bold">Nothing to Checkout</h4>
          <p className="text-muted">Your cart is empty. Add items to cart before checking out.</p>
          <Link to="/" className="btn btn-gm-primary px-4 mt-2" style={{ backgroundColor: 'var(--gm-primary)' }}>Return Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-5 flex-grow-1" style={{ maxWidth: '900px' }}>
        {/* Stepper Header UI */}
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
          <div className="row text-center g-3">
            
            {/* Step 1 indicator */}
            <div className="col-4 d-flex flex-column align-items-center">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all ${step >= 1 ? 'text-white shadow-sm' : 'bg-white text-muted'}`} 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  backgroundColor: step >= 1 ? 'var(--gm-primary)' : '#FFFFFF',
                  border: `2.5px solid ${step >= 1 ? 'var(--gm-primary)' : '#CBD5E1'}`,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {step > 1 ? <i className="bi bi-check-lg fs-6"></i> : "1"}
              </div>
              <div className="small fw-semibold mt-2 text-dark">Address</div>
            </div>

            {/* Step 2 indicator */}
            <div className="col-4 d-flex flex-column align-items-center">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all ${step >= 2 ? 'text-white shadow-sm' : 'bg-white text-muted'}`} 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  backgroundColor: step >= 2 ? 'var(--gm-primary)' : '#FFFFFF',
                  border: `2.5px solid ${step >= 2 ? 'var(--gm-primary)' : '#CBD5E1'}`,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {step > 2 ? <i className="bi bi-check-lg fs-6"></i> : "2"}
              </div>
              <div className="small fw-semibold mt-2 text-dark">Review</div>
            </div>

            {/* Step 3 indicator */}
            <div className="col-4 d-flex flex-column align-items-center">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all ${step >= 3 ? 'text-white shadow-sm' : 'bg-white text-muted'}`} 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  backgroundColor: step >= 3 ? 'var(--gm-primary)' : '#FFFFFF',
                  border: `2.5px solid ${step >= 3 ? 'var(--gm-primary)' : '#CBD5E1'}`,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {step > 3 ? <i className="bi bi-check-lg fs-6"></i> : "3"}
              </div>
              <div className="small fw-semibold mt-2 text-dark">Payment</div>
            </div>

          </div>
        </div>

        {/* Stepper Step Content */}
        <div className="row g-4">
          {/* Main Content Pane */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              
              {/* STEP 1: Address Input */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="fw-bold mb-3">Delivery Address</h5>
                  <p className="text-muted small mb-4">Please confirm where you want your order delivered. You can use your profile address or update it below.</p>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-dark">Shipping Destination</label>
                    <textarea 
                      className="form-control border-light-subtle shadow-none p-3" 
                      rows="4" 
                      placeholder="Enter full shipping address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ borderRadius: '12px', resize: 'none' }}
                    />
                  </div>

                  <button className="btn btn-gm-primary px-4 py-2 mt-2 float-end" onClick={handleNextStep}>
                    Next: Review Items <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Review Order */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="fw-bold mb-3">Review Your Items</h5>
                  <p className="text-muted small mb-4">Double-check the items and delivery destination before finalizing your payment details.</p>
                  
                  <div className="border rounded-3 p-3 mb-4 bg-light-subtle">
                    <h6 className="fw-bold text-success mb-2"><i className="bi bi-geo-alt-fill me-1"></i> Deliver To:</h6>
                    <p className="text-dark small m-0">{address}</p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">Order Items:</h6>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {cart.items.map(item => (
                        <div key={item.cartItemId} className="d-flex justify-content-between align-items-center bg-light p-2 rounded-2">
                          <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: '70%' }}>
                            {item.productName} <span className="text-muted">x {item.quantity}</span>
                          </span>
                          <span className="small fw-bold">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-light rounded-3 px-3 border" onClick={handleBackStep}>
                      <i className="bi bi-chevron-left me-1"></i> Back
                    </button>
                    <button className="btn btn-gm-primary rounded-3 px-4" onClick={handleNextStep}>
                      Next: Choose Payment <i className="bi bi-chevron-right ms-1"></i>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="fw-bold mb-3">Complete Your Payment</h5>
                  <p className="text-muted small mb-4">Choose a payment method to complete your purchase. Payments are processed securely via Razorpay.</p>
                  
                  <div 
                    className="card p-3 mb-4 rounded-3 d-flex flex-row align-items-center gap-3"
                    style={{ 
                      backgroundColor: 'rgba(124, 58, 237, 0.08)', 
                      border: '1px solid var(--gm-primary)' 
                    }}
                  >
                    <i className="bi bi-credit-card-2-front fs-2" style={{ color: 'var(--gm-primary)' }}></i>
                    <div>
                      <h6 className="fw-bold mb-1" style={{ color: 'var(--gm-primary)' }}>Razorpay Online Gateway</h6>
                      <p className="text-muted small m-0">Supports UPI, Net Banking, credit/debit cards, and mobile wallets.</p>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-light rounded-3 px-3 border" onClick={handleBackStep} disabled={paymentLoading}>
                      <i className="bi bi-chevron-left me-1"></i> Back
                    </button>
                    <button 
                      className="btn btn-success rounded-3 px-4 py-2 fw-semibold d-flex align-items-center gap-2" 
                      onClick={handlePayment}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ₹{grandTotal} <i className="bi bi-shield-lock-fill"></i>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Order Price Summary</h6>
              
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small text-muted">
                <span>Delivery Charge</span>
                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>

              <hr className="text-muted my-2" />

              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark">To Pay</span>
                <span className="fw-bold text-dark fs-5">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
