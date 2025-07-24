import React from 'react';
import { useUsers } from '../../context/UserContext';
import { FaUser, FaExclamationTriangle, FaTimes, FaStore, FaTruck, FaChartBar } from 'react-icons/fa';
import './AdminComponents.css';

const UserModal = ({ mode, onClose }) => {
  const { 
    selectedUser, 
    userFormData, 
    updateFormData, 
    updateUser, 
    deleteUser,
    setError
  } = useUsers();
  

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      const result = await updateUser(selectedUser._id || selectedUser.id, userFormData);
      
      if (result) {
        onClose();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };
  
  // Handler for deleting user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const result = await deleteUser(selectedUser._id || selectedUser.id);
      
      if (result) {
        onClose();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
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
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>
            {mode === 'view' && `User Details: ${selectedUser?.name}`}
            {mode === 'edit' && `Edit User: ${selectedUser?.name}`}
            {mode === 'delete' && 'Confirm Deletion'}
          </h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            title="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="modal-content">
          {mode === 'delete' ? (
            <div className="delete-confirmation">
              <FaExclamationTriangle size={48} color="var(--danger)" />
              <p>Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDeleteUser}
                >
                  Delete User
                </button>
              </div>
            </div>
          ) : (
            <div className="user-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userFormData.name}
                  onChange={updateFormData}
                  disabled={mode === 'view'}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userFormData.email}
                  onChange={updateFormData}
                  disabled={mode === 'view'}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={userFormData.role}
                  onChange={updateFormData}
                  disabled={mode === 'view'}
                  required
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="dealer">Dealer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userFormData.phone}
                  onChange={updateFormData}
                  disabled={mode === 'view'}
                />
              </div>
              
              <fieldset className="location-fieldset">
                <legend>Location Information</legend>
                
                <div className="form-group">
                  <label htmlFor="street">Street</label>
                  <input
                    type="text"
                    id="street"
                    name="location.street"
                    value={userFormData.location?.street || ''}
                    onChange={updateFormData}
                    disabled={mode === 'view'}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="location.city"
                      value={userFormData.location?.city || ''}
                      onChange={updateFormData}
                      disabled={mode === 'view'}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="location.state"
                      value={userFormData.location?.state || ''}
                      onChange={updateFormData}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="location.zipCode"
                    value={userFormData.location?.zipCode || ''}
                    onChange={updateFormData}
                    disabled={mode === 'view'}
                  />
                </div>
              </fieldset>
              
              {mode === 'edit' && (
                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveUser}
                  >
                    Save Changes
                  </button>
                </div>
              )}
              
              {mode === 'view' && (
                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal; 