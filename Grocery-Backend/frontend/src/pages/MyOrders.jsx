import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import OrderTimeline from '../components/OrderTimeline';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Fetch the user's order lists
  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/orders/my-orders');
      // Sort orders by date descending
      const sorted = res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to load user orders", err);
      toast.error("Failed to load orders history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Cancel order handler
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      try {
        await axiosInstance.put(`/orders/${orderId}/cancel`);
        toast.success("Order cancelled successfully");
        fetchMyOrders(); // reload order list
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to cancel order";
        toast.error(errMsg);
      }
    }
  };

  // Timeline step definitions
  const timelineStages = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

  const getStageIndex = (status) => {
    return timelineStages.indexOf(status);
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
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-5 flex-grow-1">
        <h3 className="fw-bold mb-4 text-dark">
          <i className="bi bi-receipt text-success me-2"></i> My Orders
        </h3>

        {loading && orders.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted">Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="d-flex flex-column gap-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.orderId;
              const isCancelled = order.status === 'CANCELLED';
              const activeIndex = getStageIndex(order.status);

              return (
                <div key={order.orderId} className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                  
                  {/* Order Overview Header */}
                  <div className="card-header bg-white p-3 p-md-4 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                      <div className="fw-bold text-dark fs-5">#GM-{order.orderId}</div>
                      <div className="text-muted small">
                        Placed on {new Date(order.orderDate).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        <span className="text-muted small d-block">TOTAL AMOUNT</span>
                        <span className="fw-extrabold text-dark fs-5">₹{order.totalAmount}</span>
                      </div>
                      
                      <button 
                        className="btn btn-light rounded-3 border" 
                        onClick={() => toggleExpand(order.orderId)}
                      >
                        {isExpanded ? (
                          <>Hide Details <i className="bi bi-chevron-up ms-1"></i></>
                        ) : (
                          <>View Details <i className="bi bi-chevron-down ms-1"></i></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Timeline Visual representation */}
                  <div className="px-4 py-3 bg-light-subtle border-top border-bottom">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">STATUS:</span>
                        <span className={`gm-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">PAYMENT:</span>
                        <span className={`gm-badge ${order.paymentStatus === 'SUCCESS' ? 'gm-badge-success' : 'gm-badge-danger'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Timeline stepper representation */}
                    <OrderTimeline status={order.status} />
                  </div>

                  {/* Expanded Items details */}
                  {isExpanded && (
                    <div className="card-body p-4 border-top">
                      <div className="row g-4">
                        {/* Items summary */}
                        <div className="col-md-7">
                          <h6 className="fw-bold mb-3 text-dark">Order Items</h6>
                          <div className="table-responsive">
                            <table className="table table-borderless table-sm small align-middle">
                              <thead>
                                <tr className="text-muted border-bottom">
                                  <th>Product Name</th>
                                  <th className="text-center">Price</th>
                                  <th className="text-center">Quantity</th>
                                  <th className="text-end">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item) => (
                                  <tr key={item.orderItemId} className="border-bottom">
                                    <td className="py-2.5 fw-semibold text-dark">{item.productName}</td>
                                    <td className="py-2.5 text-center text-muted">₹{item.price}</td>
                                    <td className="py-2.5 text-center fw-bold">{item.quantity}</td>
                                    <td className="py-2.5 text-end fw-bold">₹{item.subtotal}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Delivery address & cancellation actions */}
                        <div className="col-md-5">
                          <div className="bg-light p-3 rounded-3 h-100 d-flex flex-column">
                            <h6 className="fw-bold text-dark mb-2">Delivery Details</h6>
                            <p className="small text-muted mb-3">{order.deliveryAddress}</p>
                            
                            {/* Delivery Agent Details inside View Details */}
                            {order.deliveryPartnerName && (
                              <div className="p-2.5 rounded-3 bg-success-subtle text-success-emphasis border border-success-subtle d-flex align-items-center gap-2 small mb-3">
                                <i className="bi bi-person-badge fs-6"></i>
                                <span>
                                  Delivery Agent: <strong>{order.deliveryPartnerName}</strong> ({order.deliveryPartnerPhone})
                                </span>
                              </div>
                            )}
                            
                            {/* Cancellation button if order state allows */}
                            {order.status === 'PENDING' && (
                              <button 
                                className="btn btn-outline-danger btn-sm mt-auto py-2 rounded-3 w-100 fw-bold"
                                onClick={() => handleCancelOrder(order.orderId)}
                              >
                                <i className="bi bi-x-circle me-1"></i> Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Orders State */
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <i className="bi bi-journal-x text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3 fw-bold">No Orders Placed Yet</h4>
            <p className="text-muted small">You haven't placed any orders with GroceryMart yet.</p>
            <Link to="/" className="btn btn-gm-primary px-4 mt-2" style={{ backgroundColor: 'var(--gm-primary)' }}>
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
