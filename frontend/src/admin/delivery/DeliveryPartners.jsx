import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import DataTable from '../components/DataTable';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDeliveryPartners();
      setPartners(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load delivery partners registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await adminService.createDeliveryPartner({
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address
      });
      toast.success("Delivery Agent account created successfully!");
      setShowAddForm(false);
      reset();
      fetchPartners();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create account. Email or Phone might be duplicate.");
    } finally {
      setSubmitting(false);
    }
  };

  const headers = [
    { label: 'Name' },
    { label: 'Phone' },
    { label: 'Status' },
    { label: 'Orders' },
    { label: 'Station Address' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">🚚 Delivery Partners</h4>
          <p className="text-muted small mb-0">Register and manage active shipment delivery agents.</p>
        </div>
        <button 
          className="btn btn-admin-primary d-flex align-items-center gap-2"
          onClick={() => { setShowAddForm(!showAddForm); reset(); }}
          style={{ borderRadius: '8px' }}
        >
          <i className={`bi ${showAddForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showAddForm ? 'Cancel Registration' : 'Register New Agent'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Register Delivery Partner</h6>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-3">
                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <input 
                    type="text" 
                    className={`form-control shadow-none ${errors.username ? 'border-danger' : 'border-light-subtle'}`}
                    placeholder="Enter agent name"
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    {...register("username", { required: "Name is required", minLength: 3 })}
                  />
                  {errors.username && <span className="text-danger small mt-1 d-block">{errors.username.message}</span>}
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Email ID</label>
                  <input 
                    type="email" 
                    className={`form-control shadow-none ${errors.email ? 'border-danger' : 'border-light-subtle'}`}
                    placeholder="agent@grocerymart.com"
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    {...register("email", { 
                      required: "Email is required", 
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                    })}
                  />
                  {errors.email && <span className="text-danger small mt-1 d-block">{errors.email.message}</span>}
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Phone Number</label>
                  <input 
                    type="text" 
                    className={`form-control shadow-none ${errors.phone ? 'border-danger' : 'border-light-subtle'}`}
                    placeholder="10-digit mobile number"
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    {...register("phone", { 
                      required: "Phone is required", 
                      pattern: { value: /^[6-9]\d{9}$/, message: "Must be a valid 10-digit number" }
                    })}
                  />
                  {errors.phone && <span className="text-danger small mt-1 d-block">{errors.phone.message}</span>}
                </div>

                {/* Password */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Login Password</label>
                  <input 
                    type="password" 
                    className={`form-control shadow-none ${errors.password ? 'border-danger' : 'border-light-subtle'}`}
                    placeholder="Minimum 6 characters"
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                  />
                  {errors.password && <span className="text-danger small mt-1 d-block">{errors.password.message}</span>}
                </div>

                {/* Address */}
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Station Address</label>
                  <textarea 
                    rows="2"
                    className={`form-control shadow-none ${errors.address ? 'border-danger' : 'border-light-subtle'}`}
                    placeholder="Full depot or residence address"
                    style={{ borderRadius: '8px', fontSize: '0.85rem', resize: 'none' }}
                    {...register("address", { required: "Address is required" })}
                  />
                  {errors.address && <span className="text-danger small mt-1 d-block">{errors.address.message}</span>}
                </div>
              </div>

              <div className="mt-3 text-end">
                <button 
                  type="submit" 
                  className="btn btn-admin-primary px-4 fw-semibold"
                  disabled={submitting}
                  style={{ borderRadius: '8px' }}
                >
                  {submitting ? 'Registering...' : 'Register Agent'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <DataTable 
        headers={headers}
        data={partners}
        loading={loading}
        emptyMessage="No delivery agents registered yet."
        renderRow={(partner) => {
          const activeCount = partner.activeOrdersCount || 0;
          return (
            <tr key={partner.userId}>
              <td className="fw-semibold text-dark">{partner.username}</td>
              <td>{partner.phone}</td>
              <td>
                <span className={`badge ${activeCount > 0 ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-2 py-1 rounded-pill small`}>
                  {activeCount > 0 ? 'Busy' : 'Available'}
                </span>
              </td>
              <td className="fw-bold">{activeCount}</td>
              <td className="small text-muted text-truncate" style={{ maxWidth: '250px' }} title={partner.address}>
                {partner.address}
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};

export default DeliveryPartners;
