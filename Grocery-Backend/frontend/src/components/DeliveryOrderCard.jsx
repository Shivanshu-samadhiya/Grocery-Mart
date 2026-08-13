import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { deliveryApi } from '../api/deliveryApi';

const DeliveryOrderCard = ({ order, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'PICKED_UP': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'OUT_FOR_DELIVERY': return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'DELIVERED': return 'bg-success-subtle text-success border border-success-subtle';
      case 'CANCELLED': return 'bg-danger-subtle text-danger border border-danger-subtle';
      default: return 'bg-secondary-subtle text-secondary';
    }
  };

  const handleAction = async () => {
    try {
      setLoading(true);
      let updated;
      if (order.status === 'ASSIGNED') {
        updated = await deliveryApi.acceptOrder(order.orderId);
        toast.success(`Order #${order.orderId} accepted and picked up!`);
      } else if (order.status === 'PICKED_UP') {
        updated = await deliveryApi.markOutForDelivery(order.orderId);
        toast.success(`Order #${order.orderId} is now out for delivery!`);
      } else if (order.status === 'OUT_FOR_DELIVERY') {
        updated = await deliveryApi.markDelivered(order.orderId);
        toast.success(`Order #${order.orderId} marked as delivered!`);
      }
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update shipment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border border-light-subtle rounded-4 shadow-sm p-4 bg-white h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-bold text-dark fs-5">#GM-{order.orderId}</span>
          <span className={`badge px-3 py-1.5 rounded-pill small fw-bold ${getStatusColor(order.status)}`} style={{ fontSize: '0.75rem' }}>
            {order.status}
          </span>
        </div>

        <div className="border-bottom pb-3 mb-3">
          <div className="small text-muted fw-bold mb-1">CUSTOMER DETAILS</div>
          <div className="fw-bold text-dark mb-1">{order.customerName}</div>
          <div className="small text-muted mb-2">
            <i className="bi bi-telephone-fill me-1"></i> {order.customerPhone}
          </div>
          <div className="small text-muted">
            <i className="bi bi-geo-alt-fill me-1 text-danger"></i> {order.deliveryAddress}
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="small text-muted fw-bold mb-0.5">AMOUNT</div>
            <div className="fw-bold text-dark fs-5">₹{order.amount}</div>
          </div>
          <div className="col-6 text-end">
            <div className="small text-muted fw-bold mb-0.5 text-uppercase">PAYMENT</div>
            <span className={`badge ${order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} px-2.5 py-1 rounded`} style={{ fontSize: '0.7rem' }}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {order.status === 'ASSIGNED' && (
          <button 
            className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <>
                <i className="bi bi-box-seam"></i> Accept Order
              </>
            )}
          </button>
        )}

        {order.status === 'PICKED_UP' && (
          <button 
            className="btn btn-warning text-white w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={handleAction}
            disabled={loading}
            style={{ backgroundColor: '#FF9800', borderColor: '#FF9800' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <>
                <i className="bi bi-truck"></i> Mark Out for Delivery
              </>
            )}
          </button>
        )}

        {order.status === 'OUT_FOR_DELIVERY' && (
          <button 
            className="btn btn-success w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <>
                <i className="bi bi-check-circle-fill"></i> Mark Delivered
              </>
            )}
          </button>
        )}

        {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
          <div className="text-center py-2 text-muted fw-semibold small bg-light rounded-3 border">
            {order.status === 'DELIVERED' ? (
              <span className="text-success"><i className="bi bi-check2-all me-1"></i> Delivered ✓</span>
            ) : (
              <span className="text-danger"><i className="bi bi-x-circle-fill me-1"></i> Cancelled</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderCard;
