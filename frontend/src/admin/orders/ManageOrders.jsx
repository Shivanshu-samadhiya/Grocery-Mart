import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { adminService } from '../services/adminService';
import DataTable from '../components/DataTable';
import { TableRowSkeleton } from '../components/Skeletons';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delivery partner assignment states
  const [partners, setPartners] = useState([]);
  const [selectedPartnerMap, setSelectedPartnerMap] = useState({});
  const [assignLoadingMap, setAssignLoadingMap] = useState({});

  // Expandable state
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const statuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const adminDropdownStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      // Sort orders descending
      const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sorted);
      setFilteredOrders(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const data = await adminService.getDeliveryPartners();
      setPartners(data);
    } catch (err) {
      console.error("Failed to load delivery partners", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, []);

  // Filter application
  useEffect(() => {
    let result = [...orders];

    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderId.toString().includes(q) ||
        o.deliveryAddress?.toLowerCase().includes(q)
      );
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} marked as ${newStatus}`);
      fetchOrders(); // reload
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update status";
      toast.error(errMsg);
    }
  };

  const handleAssignPartner = async (orderId) => {
    const partnerId = selectedPartnerMap[orderId];
    if (!partnerId) return;
    try {
      setAssignLoadingMap(prev => ({ ...prev, [orderId]: true }));
      await adminService.assignDeliveryPartner(orderId, partnerId);
      toast.success(`Order #${orderId} assigned to partner successfully!`);
      fetchOrders(); // reload
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign delivery partner");
    } finally {
      setAssignLoadingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-status-yellow';
      case 'CONFIRMED': return 'badge-status-blue';
      case 'ASSIGNED': return 'badge-status-yellow';
      case 'PICKED_UP': return 'badge-status-purple';
      case 'OUT_FOR_DELIVERY': return 'badge-status-orange';
      case 'DELIVERED': return 'badge-status-green';
      case 'CANCELLED': return 'badge-status-red';
      default: return 'badge-status-yellow';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return 'admin-badge badge-status-green';
      case 'PENDING':
        return 'admin-badge badge-status-yellow';
      case 'FAILED':
        return 'admin-badge badge-status-red';
      case 'REFUNDED':
        return 'admin-badge badge-status-purple';
      default:
        return 'admin-badge badge-status-yellow';
    }
  };

  const tableHeaders = [
    { label: 'Order ID' },
    { label: 'Date' },
    { label: 'Delivery Address' },
    { label: 'Grand Total' },
    { label: 'Payment Status' },
    { label: 'Order Status' },
    { label: 'Actions', className: 'text-end' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0 text-dark">📦 Order Management</h4>
        <button className="btn btn-light border shadow-sm" onClick={fetchOrders} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Filter Options */}
      <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          {/* Search box */}
          <div className="flex-grow-1" style={{ maxWidth: '350px' }}>
            <input 
              type="text" 
              className="form-control border-light-subtle shadow-none py-2" 
              placeholder="Search by Order ID or Address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Status dropdown */}
          <div style={{ width: '180px' }}>
            <select 
              className="form-select border-light-subtle shadow-none py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <option value="">All Statuses</option>
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(searchQuery || statusFilter) && (
            <button 
              className="btn btn-light border py-2 px-3 small"
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              style={{ borderRadius: '8px', fontSize: '0.9rem' }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable 
        headers={tableHeaders}
        data={filteredOrders}
        loading={loading}
        emptyMessage="No orders found matching the filter guidelines."
        renderRow={(order) => {
          const isExpanded = expandedOrderId === order.orderId;
          const isTerminalState = order.status === 'DELIVERED' || order.status === 'CANCELLED';

          return (
            <React.Fragment key={order.orderId}>
              <tr>
                <td className="fw-bold text-dark">#GM-{order.orderId}</td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={order.deliveryAddress}>
                  {order.deliveryAddress}
                </td>
                <td className="fw-bold text-dark">₹{order.totalAmount}</td>
                <td>
                  <span className={getPaymentStatusBadge(order.paymentStatus)}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                    <select 
                      className="form-select form-select-sm border-light-subtle shadow-none py-1.5 px-2"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      style={{ width: '130px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      {adminDropdownStatuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  )}
                </td>
                <td className="text-end">
                  <button 
                    className="btn btn-light btn-sm border fw-semibold"
                    onClick={() => toggleExpand(order.orderId)}
                  >
                    {isExpanded ? (
                      <>Hide <i className="bi bi-chevron-up"></i></>
                    ) : (
                      <>Items <i className="bi bi-chevron-down"></i></>
                    )}
                  </button>
                </td>
              </tr>

              {/* Expanded Line Items Detail */}
              {isExpanded && (
                <tr>
                  <td colSpan="7" className="bg-light-subtle p-3">
                    <motion.div 
                      className="card p-3 border border-light-subtle rounded-3 shadow-sm bg-white" 
                      style={{ maxWidth: '650px' }}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                        <h6 className="fw-bold m-0 text-dark">Order Content Summary</h6>
                        <span className="small text-muted">Placed by Customer ID #U-{order.userId}</span>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm table-borderless small mb-0 align-middle">
                          <thead>
                            <tr className="border-bottom text-muted">
                              <th>Item name</th>
                              <th className="text-center">Price</th>
                              <th className="text-center">Quantity</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <tr key={item.orderItemId} className="border-bottom">
                                <td className="py-2 fw-semibold text-dark">{item.productName}</td>
                                <td className="py-2 text-center text-muted">₹{item.price}</td>
                                <td className="py-2 text-center fw-bold">{item.quantity}</td>
                                <td className="py-2 text-end fw-bold">₹{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Cancel order backup button if Pending */}
                      {order.status === 'PENDING' && (
                        <div className="mt-3 text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm px-4 fw-bold"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to cancel this order and restore stock?")) {
                                try {
                                  await orderService.cancelOrder(order.orderId);
                                  toast.success("Order cancelled");
                                  fetchOrders();
                                } catch (err) {
                                  toast.error("Failed to cancel order");
                                }
                              }
                            }}
                          >
                            <i className="bi bi-x-circle me-1"></i> Cancel Order
                          </button>
                        </div>
                      )}

                      {/* Delivery Partner Assignment */}
                      <div className="mt-3 pt-3 border-top">
                        <h6 className="fw-bold text-dark mb-2">Delivery Partner Assignment</h6>
                        {order.status === 'CONFIRMED' ? (
                          <div className="d-flex gap-2 align-items-center">
                            <select 
                              className="form-select form-select-sm" 
                              style={{ maxWidth: '250px', borderRadius: '8px' }}
                              value={selectedPartnerMap[order.orderId] || ''}
                              onChange={(e) => setSelectedPartnerMap(prev => ({ ...prev, [order.orderId]: e.target.value }))}
                            >
                              <option value="">Select Delivery Agent...</option>
                              {partners.map(p => (
                                <option key={p.userId} value={p.userId}>{p.username} ({p.phone})</option>
                              ))}
                            </select>
                            <button 
                              className="btn btn-admin-primary btn-sm px-3 fw-semibold text-white" 
                              style={{ borderRadius: '8px', backgroundColor: 'var(--gm-admin-primary)' }}
                              disabled={!selectedPartnerMap[order.orderId] || assignLoadingMap[order.orderId]}
                              onClick={() => handleAssignPartner(order.orderId)}
                            >
                              {assignLoadingMap[order.orderId] ? 'Assigning...' : 'Assign'}
                            </button>
                          </div>
                        ) : order.status === 'PENDING' ? (
                          <p className="small text-muted mb-0">
                            Order must be CONFIRMED before assigning a delivery partner.
                          </p>
                        ) : (
                          <div className="alert alert-success d-flex justify-content-between align-items-center mb-0 py-2 px-3" style={{ borderRadius: '8px' }}>
                            <span>
                              <i className="bi bi-truck me-2"></i> Current Status: <strong>{order.status}</strong>
                            </span>
                            <span className="badge bg-success">Assigned</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        }}
      />
    </div>
  );
};

export default ManageOrders;
