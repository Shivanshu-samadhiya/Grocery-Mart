import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/deliveryApi';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import { toast } from 'react-toastify';

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getAssignedOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load active assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">My Active Orders</h4>
          <p className="text-muted small mb-0">Manage and transition the states of your assigned shipments.</p>
        </div>
        <button className="btn btn-light border shadow-sm" onClick={fetchOrders} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i> Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((o) => (
            <div key={o.orderId} className="col-md-6 col-lg-4">
              <DeliveryOrderCard order={o} onStatusUpdated={fetchOrders} />
            </div>
          ))}
          {orders.length === 0 && (
            <div className="col-12">
              <div className="card border-0 p-5 rounded-4 bg-white shadow-sm text-center">
                <i className="bi bi-journal-check text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-bold">All caught up!</h5>
                <p className="text-muted small">No pending active shipments assigned to your profile currently.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignedOrders;
