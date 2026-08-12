import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
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

const CHART_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#06B6D4'];

const SupplierDashboard = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Products and orders are fetched independently (allSettled, not all) so
  // that one failing call doesn't blank out data the other call already
  // got back successfully. These reuse the exact same /products/my-products
  // and /orders/supplier-orders endpoints that SupplierProducts.jsx and
  // SupplierOrders.jsx already rely on elsewhere in the app.
  const fetchDashboardData = async () => {
    setLoading(true);

    const [productsResult, ordersResult] = await Promise.allSettled([
      supplierApi.getMyProducts(),
      supplierApi.getSupplierOrders()
    ]);

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value || []);
    } else {
      console.error(productsResult.reason);
      toast.error('Failed to load your products');
    }

    if (ordersResult.status === 'fulfilled') {
      setOrders(ordersResult.value || []);
    } else {
      console.error(ordersResult.reason);
      toast.error('Failed to load your orders');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ---- Summary stats, derived directly from my products/orders so the
  // dashboard doesn't depend on a separate summary endpoint ----
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockQuantity < 10).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.items || []).reduce((s, item) => s + (item.subtotal || 0), 0), 0);

    return { totalProducts, lowStockProducts, totalOrders, pendingOrders, totalRevenue };
  }, [products, orders]);

  // ---- Weekly revenue trend, built from my own line items only ----
  const { dates, points, maxVal } = useMemo(() => {
    const days = [];
    const vals = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));

      const dayRevenue = orders
        .filter(o => new Date(o.orderDate).toDateString() === d.toDateString() && o.status !== 'CANCELLED')
        .reduce((sum, o) => {
          const mine = (o.items || []).reduce((s, item) => s + (item.subtotal || 0), 0);
          return sum + mine;
        }, 0);

      vals.push(Math.round(dayRevenue));
    }

    return { dates: days, points: vals, maxVal: Math.max(...vals, 100) };
  }, [orders]);

  const generateSvgLinePath = () => {
    const paddingLeft = 40;
    const usableWidth = 460;
    const usableHeight = 170;

    if (points.length === 0) return '';

    return points.map((val, idx) => {
      const x = paddingLeft + idx * (usableWidth / 6);
      const y = usableHeight - (val / maxVal) * (usableHeight - 10) + 10;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // ---- Category distribution of my own products (donut chart) ----
  const chartData = useMemo(() => {
    const categories = {};
    products.forEach(p => {
      if (p.category) categories[p.category] = (categories[p.category] || 0) + 1;
    });

    const entries = Object.entries(categories)
      .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const total = entries.reduce((sum, c) => sum + c.count, 0) || 1;

    return entries.map((cat, idx) => ({
      ...cat,
      color: CHART_COLORS[idx % CHART_COLORS.length],
      chartPercent: (cat.count / total) * 100
    }));
  }, [products]);

  const lowStockList = useMemo(
    () => products.filter(p => p.stockQuantity < 10).sort((a, b) => a.stockQuantity - b.stockQuantity),
    [products]
  );

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 6),
    [orders]
  );

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark m-0">Welcome, {user?.username || 'Supplier'}!</h4>
        <p className="text-muted small">Here's how your catalog and orders are performing.</p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* STATS CARDS ROW */}
          <div className="row g-4 mb-4">
            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-success-subtle text-success">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>My Revenue</span>
                  <h3 className="fw-bold m-0 text-dark">₹{(stats.totalRevenue || 0).toFixed(1)}</h3>
                </div>
              </motion.div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-info-subtle text-info">
                  <i className="bi bi-cart-check"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Orders With My Items</span>
                  <h3 className="fw-bold m-0 text-dark">{stats.totalOrders}</h3>
                </div>
              </motion.div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-warning-subtle text-warning">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>My Products</span>
                  <h3 className="fw-bold m-0 text-dark">{stats.totalProducts}</h3>
                </div>
              </motion.div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <motion.div className="admin-card d-flex align-items-center gap-3" whileHover={{ y: -3 }}>
                <div className="stat-icon-wrapper bg-danger-subtle text-danger">
                  <i className="bi bi-exclamation-octagon"></i>
                </div>
                <div>
                  <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Low Stock</span>
                  <h3 className="fw-bold m-0 text-dark">{stats.lowStockProducts}</h3>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Pending orders quick stat + shortcut */}
          <div className="row g-4 mb-5">
            <div className="col-12">
              <div className="admin-card d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light-subtle">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper bg-warning text-white">
                    <i className="bi bi-hourglass-split"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>Pending Orders</span>
                    <h5 className="fw-bold m-0 text-dark">{stats.pendingOrders} awaiting fulfilment</h5>
                  </div>
                </div>
                <Link to="/supplier/orders" className="btn btn-sm px-3 fw-semibold text-white" style={{ backgroundColor: 'var(--gm-admin-primary)', borderRadius: '8px' }}>
                  View Orders <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="row g-4 mb-5">
            {/* Weekly Revenue line chart */}
            <div className="col-lg-7">
              <div className="admin-card">
                <h5 className="fw-bold text-dark mb-4"><i className="bi bi-graph-up me-1 text-success"></i> Weekly Revenue (My Products)</h5>
                <div className="chart-container text-center">
                  <svg className="w-100" viewBox="0 0 500 200" height="200" style={{ overflow: 'visible' }}>
                    <line x1="40" y1="180" x2="500" y2="180" stroke="#E9ECEF" strokeWidth="2" />
                    <line x1="40" y1="90" x2="500" y2="90" stroke="#F1F3F5" strokeDasharray="4 4" />
                    <line x1="40" y1="10" x2="500" y2="10" stroke="#F1F3F5" strokeDasharray="4 4" />

                    <path
                      d={`${generateSvgLinePath()} L 500 180 L 40 180 Z`}
                      fill="rgba(124, 58, 237, 0.06)"
                    />

                    <motion.path
                      d={generateSvgLinePath()}
                      fill="none"
                      stroke="var(--gm-admin-primary)"
                      strokeWidth="3.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                    />

                    {points.map((val, idx) => {
                      const cx = 40 + idx * (460 / 6);
                      const cy = 180 - (val / maxVal) * 170;
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={cy} r="5" fill="#FFFFFF" stroke="var(--gm-admin-primary)" strokeWidth="3" />
                          {val > 0 && (
                            <text x={cx} y={cy - 10} textAnchor="middle" fill="#212529" fontSize="9" fontWeight="700">
                              ₹{val}
                            </text>
                          )}
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

            {/* Category distribution donut */}
            <div className="col-lg-5">
              <div className="admin-card h-100">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="bi bi-pie-chart me-1 text-primary"></i> My Catalog by Category
                </h5>
                {chartData.length > 0 ? (
                  <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-4 pt-2">
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
                      <div className="position-absolute text-center">
                        <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{products.length}</div>
                        <div className="text-muted" style={{ fontSize: '0.65rem' }}>Products</div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2" style={{ minWidth: '140px' }}>
                      {chartData.map((seg, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 small">
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: seg.color, display: 'inline-block', flexShrink: 0 }}></span>
                          <span className="text-dark text-truncate" style={{ maxWidth: '110px' }}>{seg.name}</span>
                          <span className="text-muted ms-auto">{seg.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-inbox fs-2"></i>
                    <p className="small mt-2 mb-0">Add products to see your category mix here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LOW STOCK + RECENT ORDERS */}
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="admin-card h-100">
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-exclamation-triangle me-1 text-danger"></i> Low Stock Watchlist</h5>
                {lowStockList.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {lowStockList.slice(0, 6).map(p => (
                      <div key={p.productId} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img src={p.imageUrl} alt={p.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} className="rounded"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60'; }} />
                          <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: '150px' }}>{p.name}</span>
                        </div>
                        <span className={`badge ${p.stockQuantity === 0 ? 'bg-secondary' : 'bg-danger'} px-2 py-1`} style={{ borderRadius: '20px' }}>
                          {p.stockQuantity} left
                        </span>
                      </div>
                    ))}
                    <Link to="/supplier/products" className="small fw-semibold mt-1" style={{ color: 'var(--gm-admin-primary)' }}>
                      Manage stock levels <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">All your products are well stocked. 🎉</p>
                )}
              </div>
            </div>

            <div className="col-lg-7">
              <div className="admin-card h-100">
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-clock-history me-1 text-primary"></i> Recent Orders</h5>
                {recentOrders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th className="text-end">My Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(o => {
                          const mine = (o.items || []).reduce((s, item) => s + (item.subtotal || 0), 0);
                          return (
                            <tr key={o.orderId}>
                              <td className="fw-semibold text-dark">#{o.orderId}</td>
                              <td className="small text-muted">{new Date(o.orderDate).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${STATUS_BADGE[o.status] || 'badge-status-yellow'} px-2 py-1`} style={{ borderRadius: '20px' }}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="text-end fw-bold">₹{mine.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">No orders containing your products yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
