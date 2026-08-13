import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { supplierApi } from '../../api/supplierApi';

const STATUS_BADGE = {
  PENDING: 'badge-status-yellow',
  PLACED: 'badge-status-yellow',
  PROCESSING: 'badge-status-yellow',
  CONFIRMED: 'badge-status-blue',
  PACKED: 'badge-status-purple',
  SHIPPED: 'badge-status-orange',
  DELIVERED: 'badge-status-green',
  CANCELLED: 'badge-status-red'
};

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getSupplierOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const list = statusFilter === 'ALL' ? orders : orders.filter(o => o.status === statusFilter);
    return [...list].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }, [orders, statusFilter]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h3 className="fw-bold m-0">Orders With My Products</h3>
      </div>

      {/* Status filter pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map(status => (
          <button
            key={status}
            className="btn btn-sm px-3 fw-semibold"
            onClick={() => setStatusFilter(status)}
            style={{
              borderRadius: '20px',
              backgroundColor: statusFilter === status ? 'var(--gm-admin-primary)' : '#F1F3F5',
              color: statusFilter === status ? '#fff' : '#495057',
              border: 'none'
            }}
          >
            {status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="gm-table-container">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <table className="gm-table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-end">My Share</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const myShare = (order.items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
                const isExpanded = expandedOrderId === order.orderId;
                return (
                  <React.Fragment key={order.orderId}>
                    <tr onClick={() => toggleExpand(order.orderId)} style={{ cursor: 'pointer' }}>
                      <td>
                        <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'} text-muted`}></i>
                      </td>
                      <td className="fw-semibold text-dark">#{order.orderId}</td>
                      <td className="small text-muted">{new Date(order.orderDate).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-status-yellow'} px-2 py-1`} style={{ borderRadius: '20px' }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="small text-muted">{order.paymentStatus || '—'}</td>
                      <td className="text-end fw-bold">₹{myShare.toFixed(2)}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-light-subtle">
                          <div className="p-3">
                            <div className="small text-muted mb-2 fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
                              My items in this order
                            </div>
                            <table className="table table-sm mb-0">
                              <thead>
                                <tr className="text-muted small">
                                  <th>Product</th>
                                  <th className="text-end">Qty</th>
                                  <th className="text-end">Price</th>
                                  <th className="text-end">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(order.items || []).map(item => (
                                  <tr key={item.orderItemId}>
                                    <td className="fw-semibold text-dark">{item.productName}</td>
                                    <td className="text-end">{item.quantity}</td>
                                    <td className="text-end">₹{item.price}</td>
                                    <td className="text-end">₹{item.subtotal}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="small text-muted mt-2">
                              Delivery Address: <span className="text-dark">{order.deliveryAddress}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-receipt fs-2"></i>
            <h5 className="mt-2 fw-semibold">No orders found</h5>
            <p className="small">
              {statusFilter === 'ALL'
                ? 'Orders containing your products will show up here.'
                : `No orders currently have the "${statusFilter}" status.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;
