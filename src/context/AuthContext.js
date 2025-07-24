import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configure API base URL
const API_BASE_URL = 'https://backend-sigy.onrender.com';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
      
      // Enhanced user object normalization
      const userData = res.data.data || res.data.user || res.data;
      const normalizedUser = userData ? {
        ...userData,
        _id: userData._id || userData.id, // Ensure _id is always set
        id: userData._id || userData.id   // Keep id for backward compatibility
      } : null;
      
      console.log('Normalized user data:', normalizedUser);
      setUser(normalizedUser);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Authentication check failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      // Normalize user object
      const normalizedUser = {
        ...res.data.user,
        id: res.data.user._id || res.data.user.id
      };
      setUser(normalizedUser);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };
  
  const login = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Enhanced user object normalization
      const userData = res.data.user || res.data.data || res.data;
      const normalizedUser = {
        ...userData,
        _id: userData._id || userData.id, // Ensure _id is always set
        id: userData._id || userData.id   // Keep id for backward compatibility
      };
      
      console.log('Normalized user data after login:', normalizedUser);
      setUser(normalizedUser);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // Helper function to check if user has a specific role
  const isAuthorized = (role) => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError: () => setError(null),
        checkAuth,
        isAuthorized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};