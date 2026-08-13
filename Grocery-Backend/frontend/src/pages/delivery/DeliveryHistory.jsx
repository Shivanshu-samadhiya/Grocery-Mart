import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/deliveryApi';
import { toast } from 'react-toastify';

const DeliveryHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getHistory();
      // Sort history descending by ID
      const sorted = data.sort((a, b) => b.orderId - a.orderId);
      setHistory(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load delivery history records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDateFilter('');
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.orderId.toString().includes(searchQuery) ||
      item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    const matchesDate = !dateFilter || 
      new Date(item.orderDate).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark m-0">Delivery History</h4>
          <p className="text-muted small mb-0">Review previously completed or cancelled shipment records.</p>
        </div>
        <button className="btn btn-light border shadow-sm" onClick={fetchHistory} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i> Refresh Log
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
        <div className="row g-3 align-items-center">
          {/* Search box */}
          <div className="col-md-4">
            <input 
              type="text" 
              className="form-control border-light-subtle shadow-none py-2" 
              placeholder="Search by Order ID, Customer, Address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Dropdown */}
          <div className="col-md-3">
            <select 
              className="form-select border-light-subtle shadow-none py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="col-md-3">
            <input 
              type="date" 
              className="form-control border-light-subtle shadow-none py-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Clear Button */}
          {(searchQuery || statusFilter !== 'ALL' || dateFilter) && (
            <div className="col-md-2">
              <button 
                className="btn btn-light border w-100 py-2 small fw-semibold"
                onClick={clearFilters}
                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 rounded-4 bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: '0.85rem' }}>
                  <th className="py-3 ps-4">Order ID</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Address</th>
                  <th className="py-3">Grand Total</th>
                  <th className="py-3 text-end pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.orderId} style={{ fontSize: '0.9rem' }}>
                    <td className="py-3 ps-4 fw-bold text-dark">#GM-{item.orderId}</td>
                    <td className="py-3 text-muted">{new Date(item.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 fw-semibold text-dark">{item.customerName}</td>
                    <td className="py-3 text-muted text-truncate" style={{ maxWidth: '200px' }} title={item.deliveryAddress}>
                      {item.deliveryAddress}
                    </td>
                    <td className="py-3 fw-bold text-dark">₹{item.amount}</td>
                    <td className="py-3 text-end pe-4">
                      {item.status === 'DELIVERED' ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill small fw-bold">
                          Delivered ✓
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1.5 rounded-pill small fw-bold">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-folder2-open fs-2 d-block mb-2 text-muted"></i>
                      <span className="small fw-semibold">No records found matching filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;
