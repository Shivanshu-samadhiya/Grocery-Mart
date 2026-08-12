import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import DataTable from '../components/DataTable';
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
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

  // Search filtering
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.includes(q)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await userService.deleteUser(userToDelete.userId);
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user. The user might have active orders.");
    } finally {
      setActionLoading(false);
    }
  };

  const tableHeaders = [
    { label: 'User ID' },
    { label: 'Username' },
    { label: 'Email Address' },
    { label: 'Phone Number' },
    { label: 'Role' },
    { label: 'Address' },
    { label: 'Actions', className: 'text-end' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0 text-dark">User Management</h4>
        <button className="btn btn-light border shadow-sm" onClick={fetchUsers} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Search Filter */}
      <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
        <div className="d-flex gap-2" style={{ maxWidth: '400px' }}>
          <input 
            type="text" 
            className="form-control border-light-subtle shadow-none py-2" 
            placeholder="Search by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: '8px', fontSize: '0.9rem' }}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="btn btn-light border animate-fade" 
              onClick={() => setSearchQuery('')}
              style={{ borderRadius: '8px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable 
        headers={tableHeaders}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No user registrations match the query."
        renderRow={(user) => {
          const isSystemAdmin = user.role === 'ADMIN';

          return (
            <tr key={user.userId}>
              <td className="fw-bold text-dark">#U-{user.userId}</td>
              <td className="fw-semibold">{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone || 'N/A'}</td>
              <td>
                <span className={`admin-badge ${user.role === 'ADMIN' ? 'admin-badge-danger' : user.role === 'SUPPLIER' ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                  {user.role}
                </span>
              </td>
              <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={user.address}>
                {user.address || 'No address set'}
              </td>
              <td className="text-end">
                {isSystemAdmin ? (
                  <span className="text-muted small italic">System Owner</span>
                ) : (
                  <button 
                    className="btn btn-outline-danger btn-sm border-0" 
                    onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
                    title="Delete Account"
                  >
                    <i className="bi bi-trash fs-5"></i>
                  </button>
                )}
              </td>
            </tr>
          );
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationModal 
        show={showDeleteModal}
        title="Delete User Account"
        message={`Are you sure you want to delete account of ${userToDelete?.username}? This will remove all their catalog items and order references.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManageUsers;
