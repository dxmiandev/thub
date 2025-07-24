import React from 'react';
import { FaChartBar, FaTruck, FaTruckMoving, FaUser, FaDollarSign } from 'react-icons/fa';
import './AdminComponents.css';

const AnalyticsDashboard = () => {
  return (
    <div className="admin-content">
      <h4 className="admin-content-title">Analytics Dashboard</h4>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon">
            <FaTruck />
          </div>
          <div className="analytics-content">
            <h3>Trucks</h3>
            <div className="analytics-stats">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Maintenance</span>
                <span className="stat-value">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <FaTruckMoving />
          </div>
          <div className="analytics-content">
            <h3>Trailers</h3>
            <div className="analytics-stats">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Available</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reserved</span>
                <span className="stat-value">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <FaUser />
          </div>
          <div className="analytics-content">
            <h3>Users</h3>
            <div className="analytics-stats">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Buyers</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sellers</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dealers</span>
                <span className="stat-value">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <FaDollarSign />
          </div>
          <div className="analytics-content">
            <h3>Revenue</h3>
            <div className="analytics-stats">
              <div className="stat-item">
                <span className="stat-label">Today</span>
                <span className="stat-value">$0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">This Week</span>
                <span className="stat-value">$0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">This Month</span>
                <span className="stat-value">$0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="analytics-placeholder">
        <FaChartBar size={48} color="var(--gray-500)" />
        <p>Detailed analytics coming soon</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 