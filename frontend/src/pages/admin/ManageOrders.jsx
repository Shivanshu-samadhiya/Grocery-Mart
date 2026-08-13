import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Status updates options
  const orderStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/orders');
      // Sort orders by date descending
      const sorted = res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Change order status handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated successfully!");
      fetchOrders(); // reload
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update status";
      toast.error(errMsg);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED': return 'gm-badge-success';
      case 'CANCELLED': return 'gm-badge-danger';
      case 'PENDING': return 'gm-badge-warning';
      default: return 'gm-badge-info';
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <div style={{ width: '260px', flexShrink: 0 }}>
        <AdminSidebar />
      </div>

      {/* Main Admin Workspace */}
      <main className="admin-content">
        <h3 className="fw-bold mb-4">Manage Orders</h3>

        <div className="gm-table-container">
          {loading && orders.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <table className="gm-table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Delivery Address</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const isExpanded = expandedOrderId === order.orderId;
                  const canChangeStatus = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

                  return (
                    <React.Fragment key={order.orderId}>
                      <tr>
                        {/* Order ID */}
                        <td className="fw-bold text-dark">#GM-{order.orderId}</td>
                        
                        {/* Date */}
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        
                        {/* Delivery Address */}
                        <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={order.deliveryAddress}>
                          {order.deliveryAddress}
                        </td>
                        
                        {/* Amount */}
                        <td className="fw-bold text-success">₹{order.totalAmount}</td>
                        
                        {/* Payment Status */}
                        <td>
                          <span className={`gm-badge ${order.paymentStatus === 'SUCCESS' ? 'gm-badge-success' : 'gm-badge-danger'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        
                        {/* Status badge */}
                        <td>
                          {canChangeStatus ? (
                            <select 
                              className="form-select form-select-sm" 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                              style={{ width: '130px', borderRadius: '6px' }}
                            >
                              {orderStatuses.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`gm-badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-end">
                          <button 
                            className="btn btn-light btn-sm border fw-semibold"
                            onClick={() => toggleExpand(order.orderId)}
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {/* Expand details rows */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" className="bg-light p-4">
                            <div className="card p-3 border-0 rounded-3 shadow-sm bg-white" style={{ maxWidth: '600px' }}>
                              <h6 className="fw-bold mb-2">Order Line Items</h6>
                              <div className="table-responsive">
                                <table className="table table-sm table-borderless small mb-0 align-middle">
                                  <thead>
                                    <tr className="border-bottom text-muted">
                                      <th>Item</th>
                                      <th className="text-center">Price</th>
                                      <th className="text-center">Qty</th>
                                      <th className="text-end">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map(item => (
                                      <tr key={item.orderItemId} className="border-bottom">
                                        <td className="py-2.5 fw-semibold">{item.productName}</td>
                                        <td className="py-2.5 text-center">₹{item.price}</td>
                                        <td className="py-2.5 text-center fw-bold">{item.quantity}</td>
                                        <td className="py-2.5 text-end fw-bold">₹{item.subtotal}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ManageOrders;
