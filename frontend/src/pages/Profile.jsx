import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // setup React Hook Form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      username: user?.username || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await updateProfile({
        username: data.username,
        phone: data.phone,
        address: data.address
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to update profile";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      username: user?.username || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
  };

  const isDelivery = user?.role === 'DELIVERY';

  return (
    <div className={isDelivery ? "" : "d-flex flex-column min-vh-100 bg-light"}>
      {!isDelivery && <Header />}

      <main className={isDelivery ? "py-2" : "container py-5 flex-grow-1"} style={isDelivery ? { maxWidth: '700px' } : { maxWidth: '700px' }}>
        <h3 className="fw-bold mb-4 text-dark">
          <i className="bi bi-person-circle text-success me-2"></i> My Profile
        </h3>

        <motion.div 
          className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Avatar and name */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
              <i className="bi bi-person"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0">{user?.username}</h5>
              <span className="badge bg-success-subtle text-success small">
                {user?.role === 'DELIVERY' ? 'Delivery Agent' : user?.role}
              </span>
            </div>
          </div>

          <hr className="text-muted mb-4" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3">
              {/* EMAIL (Read-only) */}
              <div className="col-100">
                <label className="form-label small fw-bold text-muted">Email ID</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 shadow-none py-2" 
                  value={user?.email || ''} 
                  disabled 
                  style={{ borderRadius: '10px' }}
                />
                <span className="text-muted small fs-7 mt-1 d-block">Email address cannot be changed.</span>
              </div>

              {/* USERNAME */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Username</label>
                <input 
                  type="text" 
                  className={`form-control py-2 shadow-none border ${errors.username ? 'border-danger' : 'border-light-subtle'}`}
                  disabled={!isEditing}
                  style={{ borderRadius: '10px' }}
                  {...register("username", { 
                    required: "Username is required",
                    minLength: { value: 3, message: "Min 3 characters" },
                    maxLength: { value: 50, message: "Max 50 characters" }
                  })}
                />
                {errors.username && <span className="text-danger small mt-1 d-block">{errors.username.message}</span>}
              </div>

              {/* PHONE */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Phone Number</label>
                <input 
                  type="text" 
                  className={`form-control py-2 shadow-none border ${errors.phone ? 'border-danger' : 'border-light-subtle'}`}
                  disabled={!isEditing}
                  style={{ borderRadius: '10px' }}
                  {...register("phone", { 
                    required: "Phone number is required",
                    pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit phone number" }
                  })}
                />
                {errors.phone && <span className="text-danger small mt-1 d-block">{errors.phone.message}</span>}
              </div>

              {/* ADDRESS */}
              <div className="col-100">
                <label className="form-label small fw-bold text-muted">Delivery Address</label>
                <textarea 
                  rows="3"
                  className={`form-control py-2 shadow-none border ${errors.address ? 'border-danger' : 'border-light-subtle'}`}
                  disabled={!isEditing}
                  style={{ borderRadius: '10px', resize: 'none' }}
                  {...register("address", { required: "Address is required" })}
                />
                {errors.address && <span className="text-danger small mt-1 d-block">{errors.address.message}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-2 border-top d-flex justify-content-between align-items-center">
              {isEditing ? (
                <div className="d-flex gap-2 ms-auto">
                  <button 
                    type="button" 
                    className="btn btn-light border px-4" 
                    onClick={handleCancel}
                    disabled={loading}
                    style={{ borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success px-4"
                    disabled={loading}
                    style={{ borderRadius: '10px', backgroundColor: 'var(--gm-primary)' }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center w-100">
                  <button 
                    type="button" 
                    className="btn btn-danger py-2 rounded-3" 
                    onClick={() => { if (window.confirm("Are you sure you want to log out?")) logout(); }}
                  >
                    Logout
                  </button>
                  <div className="d-flex gap-2">
                    {isDelivery && (
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary px-3 py-2"
                        style={{ borderRadius: '10px' }}
                        onClick={() => toast.info("Security verification link sent to your email to change your password!")}
                      >
                        Change Password
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="btn btn-gm-primary px-4 py-2"
                      onClick={() => setIsEditing(true)}
                      style={{ backgroundColor: 'var(--gm-primary)' }}
                    >
                      <i className="bi bi-pencil-square me-1"></i> Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

          </form>
        </motion.div>
      </main>

      {!isDelivery && <Footer />}
    </div>
  );
};

export default Profile;
