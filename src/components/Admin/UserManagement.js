import React, { useState, useEffect } from 'react';
import { useUsers } from '../../context/UserContext';
import { FaUser, FaEdit, FaTrash, FaEye, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import UserModal from './UserModal';
import './AdminComponents.css';

const UserManagement = () => {
  const { 
    users, 
    loading, 
    error, 
    fetchUsers, 
    setSelectedUserForEdit, 
    clearSelectedUser,
    setError
  } = useUsers();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', or 'delete'
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handler for viewing user details
  const handleViewUser = (user) => {
    setSelectedUserForEdit(user);
    setModalMode('view');
    setShowModal(true);
  };
  
  // Handler for editing a user
  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setModalMode('edit');
    setShowModal(true);
  };
  
  // Handler for confirming user deletion
  const handleDeleteUserConfirm = (user) => {
    setSelectedUserForEdit(user);
    setModalMode('delete');
    setShowModal(true);
  };
  
  // Close modal and clear selected user
  const handleCloseModal = () => {
    setShowModal(false);
    clearSelectedUser();
  };
  
  // Render user role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'buyer':
        return <span className="role-badge buyer"><FaUser /> Buyer</span>;
      case 'seller':
        return <span className="role-badge seller"><FaStore /> Seller</span>;
      case 'dealer':
        return <span className="role-badge dealer"><FaTruck /> Dealer</span>;
      case 'admin':
        return <span className="role-badge admin"><FaChartBar /> Admin</span>;
      default:
        return <span className="role-badge">{role}</span>;
    }
  };
  
  return (
    <div className="admin-content">
      <h4 className="admin-content-title">User Management</h4>
      
      {error && (
        <div className="notification error">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError(null)} title="Dismiss error">
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="loading-cell" colSpan="5">
                  <LoadingSpinner size="small" />
                  <span>Loading users...</span>
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map(user => (
                <tr key={user._id || user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    {user.location && user.location.city ? (
                      `${user.location.city}, ${user.location.state}`
                    ) : (
                      <span className="text-muted">Not provided</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view"
                      onClick={() => handleViewUser(user)}
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit user"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUserConfirm(user)}
                      title="Delete user"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">
                  <div className="no-data-message">
                    <FaUser size={48} color="var(--gray-500)" />
                    <h3>No users found</h3>
                    <p>There are no users registered in the system.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* User Modal */}
      {showModal && (
        <UserModal 
          mode={modalMode} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default UserManagement; 