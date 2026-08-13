import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Calls the payment microservice (via proxy on port 9090)
      const res = await axiosInstance.get('/payments');
      // Sort payments by created timestamp descending
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payment microservice logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <div style={{ width: '260px', flexShrink: 0 }}>
        <AdminSidebar />
      </div>

      {/* Main Admin Workspace */}
      <main className="admin-content">
        <h3 className="fw-bold mb-4">Payments Audit Log</h3>

        <div className="gm-table-container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Loading transactions data...</p>
            </div>
          ) : payments.length > 0 ? (
            <table className="gm-table table-hover">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Razorpay Order ID</th>
                  <th>Razorpay Payment ID</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.paymentId}>
                    {/* Payment Local ID */}
                    <td className="fw-bold text-dark">#PAY-{payment.paymentId}</td>
                    
                    {/* Order Reference */}
                    <td className="fw-semibold">#GM-{payment.orderId}</td>
                    
                    {/* Razorpay Order ID */}
                    <td className="small text-muted">{payment.razorpayOrderId}</td>
                    
                    {/* Razorpay Payment ID */}
                    <td className="small text-muted">{payment.razorpayPaymentId || 'N/A'}</td>
                    
                    {/* Amount */}
                    <td className="fw-bold text-success">₹{payment.amount}</td>
                    
                    {/* Payment Method */}
                    <td>
                      <span className="badge bg-light text-dark border px-2.5 py-1.5" style={{ borderRadius: '30px' }}>
                        {payment.paymentMethod || 'Razorpay Gateway'}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td>
                      <span className={`gm-badge ${payment.status === 'SUCCESS' ? 'gm-badge-success' : payment.status === 'PENDING' ? 'gm-badge-warning' : 'gm-badge-danger'}`}>
                        {payment.status}
                      </span>
                    </td>
                    
                    {/* Created Date */}
                    <td className="small text-muted">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    
                    {/* Paid Date */}
                    <td className="small text-muted">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-credit-card fs-2"></i>
              <h5 className="mt-2 fw-semibold">No transaction records found</h5>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ManagePayments;
