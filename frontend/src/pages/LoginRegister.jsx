import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect page after successful login
  const from = location.state?.from?.pathname || '/';

  // react-hook-form setups
  const { register: registerField, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const selectedRole = watch("role", "USER");

  const handleToggle = () => {
    setIsLogin(!isLogin);
    reset();
  };

  const onSubmit = async (data) => {
    if (isLogin) {
      // Login flow
      try {
        const userProfile = await login(data.email, data.password);
        toast.success(`Welcome back, ${userProfile.username}!`);
        
        // Role based redirection
        if (userProfile.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userProfile.role === 'DELIVERY') {
          navigate('/delivery/dashboard', { replace: true });
        } else if (userProfile.role === 'SUPPLIER') {
          navigate('/supplier/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } catch (err) {
        toast.error(err.message || "Invalid credentials! Please try again.");
      }
    } else {
      // Registration flow
      try {
        let finalAddress = data.role === 'DELIVERY' && !data.address?.trim()
          ? 'Delivery Depot'
          : data.address;

        if (data.role === 'DELIVERY') {
          finalAddress = finalAddress + ' [DELIVERY]';
        }

        await register(
          data.username,
          data.email,
          data.password,
          data.phone,
          finalAddress,
          data.role
        );
        toast.success("Registration successful! You can now log in.");
        setIsLogin(true);
        reset();
      } catch (err) {
        const errMsg = err.message || "Registration failed. Try a different email ID.";
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-md-row bg-light" style={{ overflowX: 'hidden' }}>
      
      {/* LEFT HAND SIDE: GroceryMart Brand Banner (Exactly 50% split) */}
      <div 
        className="w-100 w-md-50 min-vh-100 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-5 position-relative" 
        style={{ 
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <div className="position-absolute opacity-10" style={{ fontSize: '15rem', top: '-5%', right: '-5%', userSelect: 'none' }}>
          🍇
        </div>
        <div className="position-absolute opacity-10" style={{ fontSize: '15rem', bottom: '-5%', left: '-5%', userSelect: 'none' }}>
          🥦
        </div>

        <motion.div 
          className="text-center position-relative z-1" 
          style={{ maxWidth: '440px' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src={logo} 
            alt="GroceryMart Logo" 
            height="110" 
            className="mb-4 rounded-4 shadow-lg p-2 bg-white"
          />
          <h1 className="fw-extrabold mb-3" style={{ fontSize: '3rem', letterSpacing: '-1.5px', fontWeight: 800 }}>
            Grocery<span className="text-warning">Mart</span>
          </h1>
          <p className="lead fw-medium mb-0 text-white-50" style={{ fontSize: '1.15rem' }}>
            Your favorite groceries handpicked and delivered fresh in 10 minutes!
          </p>
        </motion.div>
      </div>

      {/* RIGHT HAND SIDE: Login / Register Form Workspace */}
      <div className="w-100 w-md-50 min-vh-100 d-flex align-items-center justify-content-center p-4 p-md-5 bg-white">
        <motion.div 
          style={{ maxWidth: '440px', width: '100%' }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile view top logo display */}
          <div className="text-center mb-4 d-md-none">
            <img 
              src={logo} 
              alt="GroceryMart Logo" 
              height="56" 
              className="mb-2 rounded-3 shadow-sm"
            />
            <h3 className="fw-extrabold text-success mb-1">
              Grocery<span className="text-warning">Mart</span>
            </h3>
          </div>

          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">
              {isLogin ? "Welcome back" : "Create Account"}
            </h3>
            <p className="text-muted small">
              {isLogin ? "Sign in to manage catalog, orders, and browse store" : "Create your GroceryMart account to get started"}
            </p>
          </div>

          {/* Tab Selector - Active to Purple */}
          <div className="d-flex bg-light p-1 mb-4" style={{ borderRadius: '12px' }}>
            <button 
              type="button"
              className="btn w-50 fw-semibold py-2 border-0 shadow-none" 
              style={{ 
                borderRadius: '10px', 
                transition: 'all 0.2s',
                backgroundColor: isLogin ? '#7C3AED' : 'transparent',
                color: isLogin ? '#ffffff' : '#6C757D'
              }}
              onClick={() => { setIsLogin(true); reset(); }}
            >
              Login
            </button>
            <button 
              type="button"
              className="btn w-50 fw-semibold py-2 border-0 shadow-none" 
              style={{ 
                borderRadius: '10px', 
                transition: 'all 0.2s',
                backgroundColor: !isLogin ? '#7C3AED' : 'transparent',
                color: !isLogin ? '#ffffff' : '#6C757D'
              }}
              onClick={() => { setIsLogin(false); reset(); }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* USERNAME (Register Only) */}
            {!isLogin && (
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Username</label>
                <input 
                  type="text" 
                  className={`form-control py-2 shadow-none border ${errors.username ? 'border-danger' : 'border-light-subtle'}`}
                  placeholder="Full Name"
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  {...registerField("username", { 
                    required: "Username is required",
                    minLength: { value: 3, message: "Must be at least 3 characters" },
                    maxLength: { value: 50, message: "Cannot exceed 50 characters" }
                  })}
                />
                {errors.username && <span className="text-danger small mt-1 d-block">{errors.username.message}</span>}
              </div>
            )}

            {/* EMAIL */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Email Address</label>
              <input 
                type="email" 
                className={`form-control py-2 shadow-none border ${errors.email ? 'border-danger' : 'border-light-subtle'}`}
                placeholder="name@example.com"
                style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                {...registerField("email", { 
                  required: "Email is required",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format" }
                })}
              />
              {errors.email && <span className="text-danger small mt-1 d-block">{errors.email.message}</span>}
            </div>

            {/* PASSWORD */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-dark mb-0">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none p-0 border-0 shadow-none" 
                    style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: '500' }}
                    onClick={() => toast.info("Password recovery instructions sent to your email!")}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                className={`form-control py-2 shadow-none border ${errors.password ? 'border-danger' : 'border-light-subtle'}`}
                placeholder="••••••"
                style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                {...registerField("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
              {errors.password && <span className="text-danger small mt-1 d-block">{errors.password.message}</span>}
            </div>

            {/* PHONE (Register Only) */}
            {!isLogin && (
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Phone Number</label>
                <input 
                  type="text" 
                  className={`form-control py-2 shadow-none border ${errors.phone ? 'border-danger' : 'border-light-subtle'}`}
                  placeholder="10-digit mobile number"
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  {...registerField("phone", { 
                    required: "Phone number is required",
                    pattern: { value: /^[6-9]\d{9}$/, message: "Invalid phone number (10-digits starting with 6-9)" }
                  })}
                />
                {errors.phone && <span className="text-danger small mt-1 d-block">{errors.phone.message}</span>}
              </div>
            )}

            {/* ADDRESS (Register Only) */}
            {!isLogin && (
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">
                  Delivery Address {selectedRole === 'DELIVERY' && <span className="text-muted small fw-normal">(Optional)</span>}
                </label>
                <textarea 
                  rows="2"
                  className={`form-control py-2 shadow-none border ${errors.address ? 'border-danger' : 'border-light-subtle'}`}
                  placeholder={selectedRole === 'DELIVERY' ? "Full street address, flat number (optional for agents)" : "Full street address, flat number, city"}
                  style={{ borderRadius: '10px', fontSize: '0.9rem', resize: 'none' }}
                  {...registerField("address", { required: selectedRole !== 'DELIVERY' ? "Address is required" : false })}
                />
                {errors.address && <span className="text-danger small mt-1 d-block">{errors.address.message}</span>}
              </div>
            )}

            {/* ROLE SELECTOR (Register Only) */}
            {!isLogin && (
              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark d-block">Register As</label>
                <div className="d-flex gap-4 flex-wrap">
                  <div className="form-check">
                    <input 
                      className="form-check-input shadow-none" 
                      type="radio" 
                      name="role" 
                      id="roleCustomer" 
                      value="USER" 
                      defaultChecked
                      {...registerField("role", { required: "Role is required" })}
                    />
                    <label className="form-check-label small fw-medium text-dark" htmlFor="roleCustomer">
                      Customer
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input shadow-none" 
                      type="radio" 
                      name="role" 
                      id="roleDelivery" 
                      value="DELIVERY" 
                      {...registerField("role", { required: "Role is required" })}
                    />
                    <label className="form-check-label small fw-medium text-dark" htmlFor="roleDelivery">
                      Delivery Agent
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input shadow-none" 
                      type="radio" 
                      name="role" 
                      id="roleSupplier" 
                      value="SUPPLIER" 
                      {...registerField("role", { required: "Role is required" })}
                    />
                    <label className="form-check-label small fw-medium text-dark" htmlFor="roleSupplier">
                      Supplier
                    </label>
                  </div>
                </div>
                {selectedRole === 'SUPPLIER' && (
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.8rem' }}>
                    🏭 List and manage your own products, and track orders that include them from your Supplier Dashboard.
                  </p>
                )}
                {errors.role && <span className="text-danger small mt-1 d-block">{errors.role.message}</span>}
              </div>
            )}

            {/* SUBMIT BUTTON - PURPLE (#7C3AED) */}
            <button 
              type="submit" 
              className="btn w-100 py-2.5 fw-bold mb-3 shadow-sm border-0 text-white" 
              style={{ 
                borderRadius: '12px', 
                fontSize: '0.95rem', 
                backgroundColor: '#7C3AED',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#6D28D9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#7C3AED'}
            >
              {isLogin ? "Sign In" : "Register Account"}
            </button>
          </form>

          {/* Footnote Toggle Link - BLACK */}
          <div className="text-center mt-3">
            <button 
              type="button" 
              className="btn btn-link text-decoration-none small fw-semibold p-0 shadow-none border-0 text-black"
              style={{ color: '#000000', fontWeight: '600' }}
              onClick={handleToggle}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default LoginRegister;
