import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
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
      toast.success("Admin profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    toast.info("Security configurations updated. Password encryption handled via Spring Security.");
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h4 className="fw-bold mb-4 text-dark">Administrator Profile</h4>

      <div className="row g-4">
        {/* Profile Form */}
        <div className="col-12">
          <motion.div 
            className="card border-0 shadow-sm p-4 bg-white rounded-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h6 className="fw-bold mb-4 text-dark border-bottom pb-2">Profile Details</h6>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Username */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Operator Username</label>
                <input 
                  type="text"
                  className={`form-control shadow-none ${errors.username ? 'border-danger' : 'border-light-subtle'}`}
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  {...register("username", { required: "Username is required", minLength: 3 })}
                />
                {errors.username && <span className="text-danger small mt-1 d-block">{errors.username.message}</span>}
              </div>

              {/* Email (Read-only) */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Email ID (Primary)</label>
                <input 
                  type="text"
                  className="form-control bg-light border-0 shadow-none"
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Contact Phone</label>
                <input 
                  type="text"
                  className={`form-control shadow-none ${errors.phone ? 'border-danger' : 'border-light-subtle'}`}
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  {...register("phone", { required: "Phone is required", pattern: /^[6-9]\d{9}$/ })}
                />
                {errors.phone && <span className="text-danger small mt-1 d-block">{errors.phone.message || "Invalid phone format"}</span>}
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Console Station Address</label>
                <textarea 
                  className={`form-control shadow-none ${errors.address ? 'border-danger' : 'border-light-subtle'}`}
                  rows="3"
                  style={{ borderRadius: '10px', resize: 'none', fontSize: '0.9rem' }}
                  {...register("address", { required: "Address is required" })}
                />
                {errors.address && <span className="text-danger small mt-1 d-block">{errors.address.message}</span>}
              </div>

              <button 
                type="submit" 
                className="btn btn-admin-primary px-4 py-2 fw-semibold w-100 shadow" 
                disabled={loading}
                style={{ borderRadius: '10px' }}
              >
                {loading ? 'Saving Changes...' : 'Save Configuration'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
