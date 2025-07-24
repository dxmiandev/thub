import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Configure API base URL
const API_BASE_URL = 'https://backend-sigy.onrender.com';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'buyer',
    phone: '',
    location: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const { isAuthorized } = useAuth();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAuthorized('admin')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]);

  // Get a single user by ID
  const getUserById = useCallback(async (userId) => {
    if (!isAuthorized('admin')) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.message || 'Failed to load user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]);

  // Create a new user
  const createUser = useCallback(async (userData) => {
    if (!isAuthorized('admin')) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/api/users`, 
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh users list
      fetchUsers();
      
      return response.data.data;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, fetchUsers]);

  // Update a user
  const updateUser = useCallback(async (userId, userData) => {
    if (!isAuthorized('admin')) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userId}`, 
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh users list
      fetchUsers();
      
      return response.data.data;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, fetchUsers]);

  // Delete a user
  const deleteUser = useCallback(async (userId) => {
    if (!isAuthorized('admin')) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh users list
      fetchUsers();
      
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, fetchUsers]);

  // Set selected user for editing/viewing
  const setSelectedUserForEdit = useCallback((user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      location: user.location || {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
  }, []);

  // Clear selected user
  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setUserFormData({
      name: '',
      email: '',
      role: 'buyer',
      phone: '',
      location: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
  }, []);

  // Update form data
  const updateFormData = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUserFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        selectedUser,
        userFormData,
        fetchUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        setSelectedUserForEdit,
        clearSelectedUser,
        updateFormData,
        setError: (error) => setError(error)
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}; 