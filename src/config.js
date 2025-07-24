/**
 * Application configuration
 */

// API configuration
export const API_URL = 'https://backend-sigy.onrender.com'; // Always use production URL

// Default placeholder images
export const PLACEHOLDER_IMAGES = {
  truck: '/images/truck-placeholder.jpg',
  trailer: '/images/trailer-placeholder.jpg',
  profile: '/images/profile-placeholder.jpg'
};

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;

// Application-wide timeout settings (milliseconds)
export const TIMEOUTS = {
  apiRequest: 10000, // 10 seconds
  dataRefresh: 300000 // 5 minutes
};

export default {
  API_URL,
  PLACEHOLDER_IMAGES,
  DEFAULT_PAGE_SIZE,
  TIMEOUTS
}; 