import React, { useState } from 'react';
import { FaCog, FaSave, FaBell, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';
import './AdminComponents.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    localization: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="admin-content">
      <h4 className="admin-content-title">System Settings</h4>
      
      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-header">
            <FaBell className="settings-icon" />
            <h3>Notifications</h3>
          </div>
          <div className="settings-content">
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                />
                Email Notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                />
                Push Notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                />
                SMS Notifications
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-header">
            <FaLock className="settings-icon" />
            <h3>Security</h3>
          </div>
          <div className="settings-content">
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                />
                Two-Factor Authentication
              </label>
            </div>
            <div className="setting-item">
              <label>
                Session Timeout (minutes)
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="120"
                />
              </label>
            </div>
            <div className="setting-item">
              <label>
                Password Expiry (days)
                <input
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  min="30"
                  max="365"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-header">
            <FaGlobe className="settings-icon" />
            <h3>Localization</h3>
          </div>
          <div className="settings-content">
            <div className="setting-item">
              <label>
                Language
                <select
                  value={settings.localization.language}
                  onChange={(e) => handleSettingChange('localization', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                Timezone
                <select
                  value={settings.localization.timezone}
                  onChange={(e) => handleSettingChange('localization', 'timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                Date Format
                <select
                  value={settings.localization.dateFormat}
                  onChange={(e) => handleSettingChange('localization', 'dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSaveSettings}>
          <FaSave /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettings; 