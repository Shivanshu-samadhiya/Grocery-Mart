import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0.0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch admin stats summary
      const summaryRes = await axiosInstance.get('/admin/dashboard');
      setSummary(summaryRes.data);

      // Fetch all products to filter low stock items
      const productsRes = await axiosInstance.get('/products?page=0&size=100');
      const allProducts = productsRes.data.products || productsRes.data.content || [];
      const lowStock = allProducts.filter(p => p.stockQuantity < 10);
      setLowStockProducts(lowStock.slice(0, 5));

      // Fetch orders to display recent orders
      const ordersRes = await axiosInstance.get('/orders');
      const allOrders = ordersRes.data || [];
      const sortedOrders = allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setRecentOrders(sortedOrders.slice(0, 5));

    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <div style={{ width: '260px', flexShrink: 0 }}>
        <AdminSidebar />
      </div>

      {/* Main Admin Workspace */}
      <main className="admin-content">
        <h3 className="fw-bold mb-4">Dashboard Overview</h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted">Gathering statistics...</p>
          </div>
        ) : (
          <div>
            {/* Widget Grid */}
            <div className="row g-4 mb-5">
              {/* Total Revenue */}
              <div className="col-md-3">
                <div className="stat-widget">
                  <div className="stat-icon bg-success-subtle text-success">
                    <i className="bi bi-currency-rupee"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block">TOTAL REVENUE</span>
                    <h4 className="fw-bold m-0">₹{summary.totalRevenue?.toFixed(2)}</h4>
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="col-md-3">
                <div className="stat-widget">
                  <div className="stat-icon bg-info-subtle text-info">
                    <i className="bi bi-receipt"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block">TOTAL ORDERS</span>
                    <h4 className="fw-bold m-0">{summary.totalOrders}</h4>
                  </div>
                </div>
              </div>

              {/* Total Products */}
              <div className="col-md-3">
                <div className="stat-widget">
                  <div className="stat-icon bg-warning-subtle text-warning">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block">PRODUCTS</span>
                    <h4 className="fw-bold m-0">{summary.totalProducts}</h4>
                  </div>
                </div>
              </div>

              {/* Total Users */}
              <div className="col-md-3">
                <div className="stat-widget">
                  <div className="stat-icon bg-danger-subtle text-danger">
                    <i className="bi bi-people"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block">TOTAL USERS</span>
                    <h4 className="fw-bold m-0">{summary.totalUsers}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Lists Section: Recent Orders & Inventory Warnings */}
            <div className="row g-4">
              {/* Recent Orders */}
              <div className="col-lg-7">
                <div className="card border-0 bg-white shadow-sm p-4 rounded-4">
                  <h5 className="fw-bold mb-3"><i className="bi bi-clock-history me-1 text-success"></i> Recent Orders</h5>
                  
                  {recentOrders.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle small mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map(order => (
                            <tr key={order.orderId}>
                              <td className="fw-bold text-dark">#GM-{order.orderId}</td>
                              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                              <td className="fw-bold text-success">₹{order.totalAmount}</td>
                              <td>
                                <span className={`gm-badge ${order.status === 'DELIVERED' ? 'gm-badge-success' : order.status === 'CANCELLED' ? 'gm-badge-danger' : 'gm-badge-warning'}`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">No orders placed recently.</p>
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="col-lg-5">
                <div className="card border-0 bg-white shadow-sm p-4 rounded-4">
                  <h5 className="fw-bold mb-3 text-danger"><i className="bi bi-exclamation-triangle-fill me-1"></i> Stock Warnings</h5>
                  
                  {lowStockProducts.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {lowStockProducts.map(product => (
                        <div key={product.productId} className="d-flex justify-content-between align-items-center bg-danger-subtle bg-opacity-10 p-3 rounded-3 border-start border-danger border-4">
                          <div>
                            <h6 className="fw-semibold m-0 text-dark small">{product.name}</h6>
                            <span className="text-muted small">{product.category}</span>
                          </div>
                          <span className="badge bg-danger text-white px-3 py-2 rounded-pill">
                            Only {product.stockQuantity} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light rounded-3 text-success">
                      <i className="bi bi-shield-check fs-2"></i>
                      <h6 className="mt-2 fw-bold">All stock levels healthy!</h6>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
