import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import { DashboardGridSkeleton } from '../components/Skeletons';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-status-yellow';
      case 'CONFIRMED': return 'badge-status-blue';
      case 'PACKED': return 'badge-status-purple';
      case 'SHIPPED': return 'badge-status-orange';
      case 'DELIVERED': return 'badge-status-green';
      case 'CANCELLED': return 'badge-status-red';
      default: return 'badge-status-yellow';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return 'badge-status-green';
      case 'PENDING':
        return 'badge-status-yellow';
      case 'FAILED':
        return 'badge-status-red';
      case 'REFUNDED':
        return 'badge-status-purple';
      default:
        return 'badge-status-yellow';
    }
  };

  // Calculated variables
  const [derivedStats, setDerivedStats] = useState({
    pendingOrdersCount: 0,
    deliveredOrdersCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch main stats summary
      const adminStats = await adminService.getDashboardStats();
      setStats(adminStats);

      // 2. Fetch orders list
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);

      // 3. Fetch products list
      const productsData = await productService.getProducts(0, 100);
      const allProducts = productsData.products || [];
      setProducts(allProducts);

      // 4. Fetch payments list from microservice
      const allPayments = await paymentService.getAllPayments();
      setPayments(allPayments);

      // 5. Fetch users list
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);

      // 6. Calculate derived parameters
      const pending = allOrders.filter(o => o.status === 'PENDING').length;
      const delivered = allOrders.filter(o => o.status === 'DELIVERED').length;
      const lowStock = allProducts.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length;
      const outOfStock = allProducts.filter(p => p.stockQuantity === 0).length;

      setDerivedStats({
        pendingOrdersCount: pending,
        deliveredOrdersCount: delivered,
        lowStockCount: lowStock,
        outOfStockCount: outOfStock
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard console stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper: Prepare Chart Data for Last 7 Days
  const getWeeklyRevenuePoints = () => {
    const points = [];
    const dates = [];
    
    // Get last 7 days formatted dates
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
      
      // Calculate revenue sum for this day
      const dayRevenue = orders
        .filter(o => {
          const oDate = new Date(o.orderDate);
          return oDate.toDateString() === d.toDateString() && o.paymentStatus === 'SUCCESS';
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);
      points.push(dayRevenue);
    }

    const maxVal = Math.max(...points, 1000);
    return { dates, points, maxVal };
  };

  const { dates, points, maxVal } = getWeeklyRevenuePoints();

  // Helper: Generate Line SVG Path coordinates
  const generateSvgLinePath = () => {
    const width = 500;
    const height = 180;
    const paddingLeft = 40;
    const paddingBottom = 20;
    const usableWidth = width - paddingLeft;
    const usableHeight = height - paddingBottom;

    if (points.length === 0) return '';
    
    return points.map((val, idx) => {
      const x = paddingLeft + (idx * (usableWidth / 6));
      const y = usableHeight - (val / maxVal * (usableHeight - 10));
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Helper: Calculate category share distribution
  const getCategoryShare = () => {
    const categories = {};
    products.forEach(p => {
      if (p.category) {
        categories[p.category] = (categories[p.category] || 0) + 1;
      }
    });

    return Object.entries(categories)
      .map(([name, count]) => ({
        name: name.replace(/_/g, ' '),
        count,
        percent: Math.round((count / (products.length || 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  const categoryShare = getCategoryShare();

  const CHART_COLORS = [
    '#7C3AED', // Brand Purple
    '#3B82F6', // Blue
    '#10B981', // Emerald Green
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#EF4444', // Red
    '#06B6D4'  // Cyan
  ];

  const totalCategoryItemsCount = categoryShare.reduce((sum, c) => sum + c.count, 0);
  const chartData = categoryShare.map((cat, idx) => ({
    ...cat,
    color: CHART_COLORS[idx % CHART_COLORS.length],
    chartPercent: totalCategoryItemsCount > 0 ? (cat.count / totalCategoryItemsCount) * 100 : 0
  }));

  return (
    <div>
      {loading ? (
        <DashboardGridSkeleton />
      ) : (
        <div>
          {/* STATS CARDS ROW 1 */}
          <div className="row g-4 mb-4">
            {/* Total Revenue */}
            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-success-subtle text-success">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Total Revenue</span>
                  <h3 className="fw-bold m-0 text-dark">₹{stats.totalRevenue?.toFixed(1)}</h3>
                </div>
              </motion.div>
            </div>

            {/* Total Orders */}
            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-info-subtle text-info">
                  <i className="bi bi-cart-check"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Total Orders</span>
                  <h3 className="fw-bold m-0 text-dark">{stats.totalOrders}</h3>
                </div>
              </motion.div>
            </div>

            {/* Total Products */}
            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-warning-subtle text-warning">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Total Products</span>
                  <h3 className="fw-bold m-0 text-dark">{stats.totalProducts}</h3>
                </div>
              </motion.div>
            </div>

            {/* Total Users */}
            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-danger-subtle text-danger">
                  <i className="bi bi-people"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Total Users</span>
                  <h3 className="fw-bold m-0 text-dark">{stats.totalUsers}</h3>
                </div>
              </motion.div>
            </div>
          </div>

          {/* STATS CARDS ROW 2: DETAILED INVENTORY STATES */}
          <div className="row g-4 mb-5">
            {/* Pending Orders */}
            <div className="col-sm-6 col-lg-3">
              <div className="admin-card d-flex align-items-center gap-3 bg-light-subtle">
                <div className="stat-icon-wrapper bg-warning text-white">
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Pending Orders</span>
                  <h5 className="fw-bold m-0 text-dark">{derivedStats.pendingOrdersCount} Active</h5>
                </div>
              </div>
            </div>

            {/* Delivered Orders */}
            <div className="col-sm-6 col-lg-3">
              <div className="admin-card d-flex align-items-center gap-3 bg-light-subtle">
                <div className="stat-icon-wrapper bg-success text-white">
                  <i className="bi bi-truck"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Delivered Orders</span>
                  <h5 className="fw-bold m-0 text-dark">{derivedStats.deliveredOrdersCount} Completed</h5>
                </div>
              </div>
            </div>

            {/* Low Stock Warns */}
            <div className="col-sm-6 col-lg-3">
              <div className="admin-card d-flex align-items-center gap-3 bg-light-subtle">
                <div className="stat-icon-wrapper bg-danger text-white">
                  <i className="bi bi-exclamation-octagon"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Low Stock Items</span>
                  <h5 className="fw-bold m-0 text-dark">{derivedStats.lowStockCount} Warnings</h5>
                </div>
              </div>
            </div>

            {/* Out of Stock Blocker */}
            <div className="col-sm-6 col-lg-3">
              <div className="admin-card d-flex align-items-center gap-3 bg-light-subtle">
                <div className="stat-icon-wrapper bg-secondary text-white">
                  <i className="bi bi-x-circle"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Out of Stock</span>
                  <h5 className="fw-bold m-0 text-dark">{derivedStats.outOfStockCount} items</h5>
                </div>
              </div>
            </div>
          </div>

          {/* GRAPHICAL CHARTS PANELS */}
          <div className="row g-4 mb-5">
            {/* Weekly Revenue line chart */}
            <div className="col-lg-7">
              <div className="admin-card">
                <h5 className="fw-bold text-dark mb-4"><i className="bi bi-graph-up me-1 text-success"></i> Weekly Sales Trend</h5>
                <div className="chart-container text-center">
                  <svg className="w-100" viewBox="0 0 500 200" height="200" style={{ overflow: 'visible' }}>
                    {/* Grid lines */}
                    <line x1="40" y1="180" x2="500" y2="180" stroke="#E9ECEF" strokeWidth="2" />
                    <line x1="40" y1="90" x2="500" y2="90" stroke="#F1F3F5" strokeDasharray="4 4" />
                    <line x1="40" y1="10" x2="500" y2="10" stroke="#F1F3F5" strokeDasharray="4 4" />

                    {/* Smooth Area Path */}
                    <path 
                      d={`${generateSvgLinePath()} L 500 180 L 40 180 Z`} 
                      fill="rgba(46, 125, 50, 0.05)" 
                    />

                    {/* Main Line */}
                    <motion.path 
                      d={generateSvgLinePath()} 
                      fill="none" 
                      stroke="var(--gm-admin-primary)" 
                      strokeWidth="3.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                    />

                    {/* Coordinate circles and texts */}
                    {points.map((val, idx) => {
                      const cx = 40 + (idx * (460 / 6));
                      const cy = 180 - (val / maxVal * 170);
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={cy} r="5" fill="#FFFFFF" stroke="var(--gm-admin-primary)" strokeWidth="3" />
                          {/* Label values above circles */}
                          {val > 0 && (
                            <text x={cx} y={cy - 10} textAnchor="middle" fill="#212529" fontSize="9" fontWeight="700">
                              ₹{val}
                            </text>
                          )}
                          {/* Axis label date */}
                          <text x={cx} y="195" textAnchor="middle" fill="#6C757D" fontSize="9">
                            {dates[idx]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Products Share Category pie chart list */}
            <div className="col-lg-5">
              <div className="admin-card h-100">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="bi bi-pie-chart me-1 text-primary"></i> Category Distribution
                </h5>
                {chartData.length > 0 ? (
                  <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-4 pt-2">
                    
                    {/* Left: The Donut Chart */}
                    <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '140px', height: '140px', flexShrink: 0 }}>
                      <svg width="130" height="130" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                        {chartData.map((seg, idx) => {
                          const previousAccumulatedPercent = chartData.slice(0, idx).reduce((sum, item) => sum + item.chartPercent, 0);
                          const strokeDashOffset = -((previousAccumulatedPercent / 100) * 188.5);
                          return (
                            <motion.circle
                              key={idx}
                              cx="40"
                              cy="40"
                              r="30"
                              fill="transparent"
                              stroke={seg.color}
                              strokeWidth="8"
                              strokeDasharray={`${(seg.chartPercent / 100) * 188.5} 188.5`}
                              strokeDashoffset={strokeDashOffset}
                              initial={{ strokeDasharray: `0 188.5` }}
                              animate={{ strokeDasharray: `${(seg.chartPercent / 100) * 188.5} 188.5` }}
                              transition={{ duration: 0.8, delay: idx * 0.15 }}
                              style={{ cursor: 'pointer' }}
                              whileHover={{ strokeWidth: 10 }}
                            />
                          );
                        })}
                      </svg>
                      {/* Center hole label */}
                      <div className="position-absolute d-flex flex-column align-items-center justify-content-center text-center">
                        <span className="fw-extrabold text-dark m-0" style={{ fontSize: '1.25rem', lineHeight: 1 }}>{totalCategoryItemsCount}</span>
                        <span className="text-muted small" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</span>
                      </div>
                    </div>

                    {/* Right: Legends */}
                    <div className="flex-grow-1 w-100 d-flex flex-column gap-2">
                      {chartData.map((seg, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ backgroundColor: 'rgba(0,0,0,0.015)', borderLeft: `3px solid ${seg.color}` }}>
                          <div className="d-flex align-items-center gap-2">
                            <span className="small fw-bold text-dark text-truncate" style={{ maxWidth: '120px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              {seg.name}
                            </span>
                          </div>
                          <span className="small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
                            {seg.count} items ({seg.percent}%)
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-5 text-muted small">No category details found</div>
                )}
              </div>
            </div>
          </div>

          {/* RECENT RECORDS TABLES LISTS */}
          <div className="row g-4">
            {/* Recent Orders log */}
            <div className="col-lg-6">
              <div className="admin-card">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-dark m-0">
                    <i className="bi bi-clock-history me-1 text-primary"></i> Recent Orders
                  </h6>
                  <Link to="/admin/orders" className="text-primary small fw-semibold text-decoration-none">
                    View All <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle small mb-0">
                    <thead>
                      <tr className="text-muted border-bottom">
                        <th>Order</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...orders].sort((a, b) => b.orderId - a.orderId).slice(0, 5).map(o => (
                        <tr key={o.orderId}>
                          <td className="fw-semibold">#GM-{o.orderId}</td>
                          <td className="fw-bold text-dark">₹{o.totalAmount}</td>
                          <td>
                            <span className={`admin-badge ${getStatusBadge(o.status)}`} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan="3" className="text-center text-muted small py-3">No orders found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Razorpay Payments log */}
            <div className="col-lg-6">
              <div className="admin-card">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-dark m-0">
                    <i className="bi bi-credit-card me-1 text-primary"></i> Recent Payments
                  </h6>
                  <Link to="/admin/payments" className="text-primary small fw-semibold text-decoration-none">
                    View All <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle small mb-0">
                    <thead>
                      <tr className="text-muted border-bottom">
                        <th>Txn ID</th>
                        <th>Amt</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...payments].sort((a, b) => b.paymentId - a.paymentId).slice(0, 5).map(p => (
                        <tr key={p.paymentId}>
                          <td className="fw-semibold">#PAY-{p.paymentId}</td>
                          <td className="fw-bold text-dark">₹{p.amount}</td>
                          <td>
                            <span className={`admin-badge ${getPaymentStatusBadge(p.status)}`} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr><td colSpan="3" className="text-center text-muted small py-3">No payments recorded</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
