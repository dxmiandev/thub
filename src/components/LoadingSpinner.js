import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullPage = false }) => (
  <div className={`loading-spinner ${fullPage ? 'full-page' : ''}`}>
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

export default LoadingSpinner;