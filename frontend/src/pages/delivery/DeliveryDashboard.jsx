import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryApi } from '../../api/deliveryApi';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import { toast } from 'react-toastify';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todaysAssignedOrders: 0,
    pendingDeliveries: 0,
    completedToday: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        deliveryApi.getDashboard(),
        deliveryApi.getAssignedOrders()
      ]);
      setStats(statsData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark m-0">Welcome, {user?.username || 'Delivery Agent'}!</h4>
        <p className="text-muted small">Here is a quick look at your active shipment logistics today.</p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* STATS SUMMARY ROW */}
          <div className="row g-4 mb-5">
            {/* Today's Assigned */}
            <div className="col-sm-6 col-lg">
              <div className="card border border-light-subtle shadow-sm p-3 bg-white rounded-4 d-flex flex-row align-items-center gap-3">
                <div className="p-3 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-clock-history fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Today's Assigned</span>
                  <h4 className="fw-bold m-0 text-dark">{stats.todaysAssignedOrders}</h4>
                </div>
              </div>
            </div>

            {/* Pending Deliveries */}
            <div className="col-sm-6 col-lg">
              <div className="card border border-light-subtle shadow-sm p-3 bg-white rounded-4 d-flex flex-row align-items-center gap-3">
                <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-hourglass-split fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Pending Deliveries</span>
                  <h4 className="fw-bold m-0 text-dark">{stats.pendingDeliveries}</h4>
                </div>
              </div>
            </div>

            {/* Completed Deliveries */}
            <div className="col-sm-6 col-lg">
              <div className="card border border-light-subtle shadow-sm p-3 bg-white rounded-4 d-flex flex-row align-items-center gap-3">
                <div className="p-3 bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-truck fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Completed Today</span>
                  <h4 className="fw-bold m-0 text-dark">{stats.completedToday}</h4>
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="col-sm-6 col-lg">
              <div className="card border border-light-subtle shadow-sm p-3 bg-white rounded-4 d-flex flex-row align-items-center gap-3">
                <div className="p-3 bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-x-circle fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Cancelled</span>
                  <h4 className="fw-bold m-0 text-dark">{stats.cancelledOrders}</h4>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="col-sm-6 col-lg">
              <div className="card border border-light-subtle shadow-sm p-3 bg-white rounded-4 d-flex flex-row align-items-center gap-3">
                <div className="p-3 bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-cash-coin fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Total Revenue</span>
                  <h4 className="fw-bold m-0 text-dark">₹{stats.totalRevenue || 0}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE QUEUE SECTION */}
          <h5 className="fw-bold text-dark mb-4">📦 Active Delivery Queue</h5>
          <div className="row g-4">
            {orders.map((o) => (
              <div key={o.orderId} className="col-md-6 col-lg-4">
                <DeliveryOrderCard order={o} onStatusUpdated={fetchDashboardData} />
              </div>
            ))}
            {orders.length === 0 && (
              <div className="col-12">
                <div className="card border-0 p-5 rounded-4 bg-white shadow-sm text-center">
                  <i className="bi bi-box-seam text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 fw-bold">No active delivery assignments</h5>
                  <p className="text-muted small">You will see new delivery requests here once the administrator assigns orders to you.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
