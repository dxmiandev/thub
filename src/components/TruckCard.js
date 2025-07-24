import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './TruckCard.css';
import { getFullImageUrl, handleImageError, DEFAULT_PLACEHOLDERS } from '../utils/imageHelper';
import { API_URL } from '../config';

// Use API_URL from config instead of hardcoding
// const API_BASE_URL = 'https://backend-sigy.onrender.com';

const TruckCard = ({ truck, onClick }) => {
  // State to track if the image has loaded
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(DEFAULT_PLACEHOLDERS.truck);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  
  // Set up image source with improved fallback and error handling
  useEffect(() => {
    try {
      // Check for multiple possible image sources
      if (truck.images && truck.images.length > 0) {
        // First try images array (primary)
        const fullUrl = getFullImageUrl(truck.images[0], 'truck');
        setImageSrc(fullUrl);
      } else if (truck.imageUrl) {
        // Then try imageUrl (secondary)
        const fullUrl = getFullImageUrl(truck.imageUrl, 'truck');
        setImageSrc(fullUrl);
      } else if (truck.image) {
        // Then try image field (tertiary)
        const fullUrl = getFullImageUrl(truck.image, 'truck');
        setImageSrc(fullUrl);
      } else {
        // Default fallback
        setImageSrc(DEFAULT_PLACEHOLDERS.truck);
      }
    } catch (err) {
      console.error("Error setting truck image:", err);
      setImageSrc(DEFAULT_PLACEHOLDERS.truck);
    }
    
    // Add window resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [truck]);
  
  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(truck.price || 0);

  // Format mileage with commas
  const formattedMileage = new Intl.NumberFormat('en-US').format(truck.mileage || 0);

  // Handle image load error with better error recovery
  const handleImageLoadError = (e) => {
    console.log("Image load error for truck:", truck._id);
    
    // Store the original image URL to try different proxies
    if (!e.target.dataset.originalSrc) {
      const originalSrc = truck.images?.[0] || truck.imageUrl || truck.image;
      if (originalSrc) {
        e.target.dataset.originalSrc = originalSrc;
        e.target.dataset.proxyAttempt = "0";
      }
    }
    
    handleImageError(e, 'truck');
    setImageLoaded(true);
  };

  // Get the most important specs for mobile (limited to 3)
  const getMobileSpecs = () => {
    const specs = [];
    
    // Price is always first if available
    if (truck.price !== undefined) {
      specs.push({
        label: "Price",
        value: formattedPrice,
        className: "truck-card-price",
        priority: 1
      });
    }
    
    // Then mileage
    if (truck.mileage !== undefined) {
      specs.push({
        label: "Mileage",
        value: `${formattedMileage} mi`,
        priority: 2
      });
    }
    
    // Then fuel type
    if (truck.fuelType) {
      specs.push({
        label: "Fuel",
        value: truck.fuelType,
        priority: 3
      });
    }
    
    // Then type
    if (truck.type && specs.length < 3) {
      specs.push({
        label: "Type",
        value: truck.type,
        priority: 4
      });
    }
    
    // Then license if we have space
    if (truck.licensePlate && specs.length < 3) {
      specs.push({
        label: "License",
        value: truck.licensePlate,
        priority: 5
      });
    }
    
    // Sort by priority and return up to 3 specs
    return specs.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  const mobileSpecs = getMobileSpecs();

  return (
    <div className="truck-card" onClick={onClick}>
      <div className="truck-card-image-container">
        <img 
          src={imageSrc}
          alt={`${truck.year} ${truck.make} ${truck.model}`} 
          className="truck-card-image"
          onError={handleImageLoadError}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          crossOrigin="anonymous"
        />
        {truck.status && (
          <div className={`truck-card-availability ${truck.status}`}>{truck.status}</div>
        )}
      </div>
      
      <div className="truck-card-content">
        <h3 className="truck-card-title">
          {truck.year} {truck.make} {truck.model}
        </h3>
        
        {isMobile ? (
          /* Mobile-optimized specs display */
          <div className="truck-card-specs mobile-specs">
            {mobileSpecs.map((spec, index) => (
              <div key={index} className="truck-card-spec">
                <span className="truck-card-spec-label">{spec.label}:</span>
                <span className={`truck-card-spec-value ${spec.className || ''}`}>{spec.value}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop specs display */
          <div className="truck-card-specs">
            {truck.price !== undefined && (
              <div className="truck-card-spec">
                <span className="truck-card-spec-label">Price:</span>
                <span className="truck-card-spec-value truck-card-price">{formattedPrice}</span>
              </div>
            )}
            
            {truck.mileage !== undefined && (
              <div className="truck-card-spec">
                <span className="truck-card-spec-label">Mileage:</span>
                <span className="truck-card-spec-value">{formattedMileage} mi</span>
              </div>
            )}
            
            {truck.licensePlate && (
              <div className="truck-card-spec">
                <span className="truck-card-spec-label">License:</span>
                <span className="truck-card-spec-value">{truck.licensePlate}</span>
              </div>
            )}
            
            {truck.fuelType && (
              <div className="truck-card-spec">
                <span className="truck-card-spec-label">Fuel:</span>
                <span className="truck-card-spec-value">{truck.fuelType}</span>
              </div>
            )}
            
            {truck.type && (
              <div className="truck-card-spec">
                <span className="truck-card-spec-label">Type:</span>
                <span className="truck-card-spec-value">{truck.type}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="truck-card-footer">
          {truck.status && (
            <span className={`truck-card-condition ${truck.status}`}>{truck.status}</span>
          )}
          <span className="truck-card-view-details">View Details</span>
        </div>
        
        {/* Mobile-friendly view details button */}
        {isMobile && (
          <div className="mobile-view-details-btn">
            <span>View Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

TruckCard.propTypes = {
  truck: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    make: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    mileage: PropTypes.number,
    fuelType: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    imageUrl: PropTypes.string,
    price: PropTypes.number,
    licensePlate: PropTypes.string,
    capacity: PropTypes.string,
    notes: PropTypes.string,
    lastMaintenance: PropTypes.string,
    nextMaintenanceDue: PropTypes.string,
    createdAt: PropTypes.string,
    owner: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default TruckCard;