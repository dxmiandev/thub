import React from 'react';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message, 
  onRetry, 
  fullPage = false, 
  title = "Error", 
  icon = <FaExclamationTriangle className="error-icon" />
}) => {
  const containerClass = fullPage ? "error-container full-page" : "error-container";
  
  return (
    <div className={containerClass}>
      {icon}
      <h2 className="error-title">{title}</h2>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          <FaSync className="retry-icon" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;