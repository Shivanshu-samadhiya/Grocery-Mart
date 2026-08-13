import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This will also remove any related orders or supplier products.")) {
      try {
        await axiosInstance.delete(`/users/${userId}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Simple client-side search filtering
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <div style={{ width: '260px', flexShrink: 0 }}>
        <AdminSidebar />
      </div>

      {/* Main Admin Workspace */}
      <main className="admin-content">
        <h3 className="fw-bold mb-4">Manage Users</h3>

        {/* Search filter card */}
        <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
          <div className="d-flex gap-2" style={{ maxWidth: '400px' }}>
            <input 
              type="text" 
              className="form-control border-light-subtle shadow-none py-2" 
              placeholder="Search user by name, email, or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '8px' }}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="btn btn-light border" 
                onClick={() => setSearchQuery('')}
                style={{ borderRadius: '8px' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="gm-table-container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="gm-table table-hover">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Delivery Address</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.userId}>
                    {/* User ID */}
                    <td className="fw-bold text-dark">#U-{user.userId}</td>
                    
                    {/* Username */}
                    <td className="fw-semibold">{user.username}</td>
                    
                    {/* Email */}
                    <td>{user.email}</td>
                    
                    {/* Phone */}
                    <td>{user.phone}</td>
                    
                    {/* Role */}
                    <td>
                      <span className={`gm-badge ${user.role === 'ADMIN' ? 'gm-badge-danger' : user.role === 'SUPPLIER' ? 'gm-badge-warning' : 'gm-badge-success'}`}>
                        {user.role}
                      </span>
                    </td>
                    
                    {/* Address summary */}
                    <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={user.address}>
                      {user.address}
                    </td>

                    {/* Actions */}
                    <td className="text-end">
                      {user.role !== 'ADMIN' ? (
                        <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDeleteUser(user.userId)}>
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      ) : (
                        <span className="text-muted small italic">System Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-2"></i>
              <h5 className="mt-2 fw-semibold">No users found</h5>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ManageUsers;
