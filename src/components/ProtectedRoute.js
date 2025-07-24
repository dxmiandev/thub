import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading, isAuthorized } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page and store the page they were trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Admin always has access to any protected route
  if (user && user.role === 'admin') {
    return children;
  }

  // Check if user has required role
  if (requiredRole) {
    // If we have an array of roles, check if user has any of them
    const requiresOneOf = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!isAuthorized(requiresOneOf)) {
      // Redirect to dashboard with unauthorized message
      return <Navigate to="/dashboard" state={{ 
        notification: {
          type: 'error',
          message: 'You are not authorized to access this page.'
        }
      }} replace />;
    }
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;