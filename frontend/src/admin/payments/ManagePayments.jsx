import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments();
      // Sort payments descending
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(sorted);
      setFilteredPayments(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions log from Payment Microservice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter application
  useEffect(() => {
    let result = [...payments];

    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.paymentId.toString().includes(q) ||
        p.orderId.toString().includes(q) ||
        p.razorpayPaymentId?.toLowerCase().includes(q)
      );
    }

    setFilteredPayments(result);
  }, [searchQuery, statusFilter, payments]);

  const getStatusBadge = (status) => {
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

  const tableHeaders = [
    { label: 'Payment ID' },
    { label: 'Order ID' },
    { label: 'Razorpay Reference' },
    { label: 'Amount' },
    { label: 'Method' },
    { label: 'Status' },
    { label: 'Transaction Date' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0 text-dark">Payment Management</h4>
        <button className="btn btn-light border shadow-sm" onClick={fetchPayments} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Filters Area */}
      <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          {/* Search box */}
          <div className="flex-grow-1" style={{ maxWidth: '350px' }}>
            <input 
              type="text" 
              className="form-control border-light-subtle shadow-none py-2" 
              placeholder="Search by Payment ID or Order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Status filter */}
          <div style={{ width: '180px' }}>
            <select 
              className="form-select border-light-subtle shadow-none py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
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
        data={filteredPayments}
        loading={loading}
        emptyMessage="No payment transaction logs match the filter criteria."
        renderRow={(payment) => (
          <tr key={payment.paymentId}>
            <td className="fw-bold text-dark">#PAY-{payment.paymentId}</td>
            <td className="fw-semibold">#GM-{payment.orderId}</td>
            <td>
              <div className="small text-muted">{payment.razorpayOrderId}</div>
              {payment.razorpayPaymentId && (
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-tag-fill me-1"></i> {payment.razorpayPaymentId}
                </div>
              )}
            </td>
            <td className="fw-bold text-dark">₹{payment.amount}</td>
            <td>
              <span className="badge bg-light text-dark border px-2.5 py-1.5" style={{ borderRadius: '30px', fontSize: '0.75rem' }}>
                {payment.paymentMethod || 'Razorpay Online'}
              </span>
            </td>
            <td>
              <span className={`admin-badge ${getStatusBadge(payment.status)}`}>
                {payment.status}
              </span>
            </td>
            <td>{new Date(payment.createdAt).toLocaleString()}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default ManagePayments;
