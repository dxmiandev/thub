import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TrailerCard.css';
import { getFullImageUrl, handleImageError, DEFAULT_PLACEHOLDERS } from '../utils/imageHelper';
import { API_URL } from '../config';

// Function to standardize image URL handling
const getStandardizedImageUrl = (imageUrl) => {
  // If imageUrl is empty or null, return placeholder
  if (!imageUrl || imageUrl === '') {
    return 'https://via.placeholder.com/400x300/1e293b/667799?text=No+Image';
  }
  
  // If it's already a full URL (http or https), use as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it starts with /uploads/trailers/, use as is with API_URL
  if (imageUrl.startsWith('/uploads/trailers/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // If it starts with just /uploads/, append API_URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // For all other cases (like just filename), assume it's in /uploads/trailers/
  return `${API_URL}/uploads/trailers/${imageUrl}`;
};

const TrailerCard = ({ trailer, onClick, viewMode }) => {
  // State for image loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  
  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(trailer.price || 0);

  // Set up image source
  useEffect(() => {
    try {
      // First check for base64 imageData (stored in MongoDB)
      if (trailer.imageData && trailer.imageData.startsWith('data:')) {
        console.log('Using base64 image data from MongoDB');
        setImageSrc(trailer.imageData);
      }
      // Use imageUrl field if available
      else if (trailer.imageUrl) {
        const url = getFullImageUrl(trailer.imageUrl, 'trailer');
        setImageSrc(url);
      } 
      // Otherwise, check images array (legacy)
      else if (trailer.images && trailer.images.length > 0) {
        const url = getFullImageUrl(trailer.images[0], 'trailer');
        setImageSrc(url);
      } 
      // Fallback to placeholder
      else {
        setImageSrc(DEFAULT_PLACEHOLDERS.trailer);
      }
    } catch (error) {
      console.error('Error setting trailer image source:', error);
      setImageSrc(DEFAULT_PLACEHOLDERS.trailer);
    }
  }, [trailer]);

  // Handle image load error
  const handleImageLoadError = (e) => {
    try {
      // Store the original image URL to try different proxies
      if (!e.target.dataset.originalSrc) {
        const originalSrc = trailer.imageUrl || (trailer.images && trailer.images.length > 0 ? trailer.images[0] : null);
        if (originalSrc) {
          e.target.dataset.originalSrc = originalSrc;
          e.target.dataset.proxyAttempt = "0";
        }
      }
      
      handleImageError(e, 'trailer');
    } catch (error) {
      e.target.src = DEFAULT_PLACEHOLDERS.trailer;
    } finally {
      setImageLoaded(true);
    }
  };

  // Get status class
  const getStatusClass = (status) => {
    if (!status) return '';
    
    status = status.toLowerCase();
    if (status === 'available') return 'available';
    if (status === 'sold') return 'sold';
    if (status === 'maintenance' || status === 'repair') return 'maintenance';
    if (status === 'used') return 'used';
    if (status === 'retired') return 'retired';
    
    return status;
  };

  return (
    <div 
      className={`trailer-card ${viewMode === 'list' ? 'list-mode' : ''}`} 
      onClick={() => onClick(trailer._id)}
    >
      <div className={`trailer-image ${!imageLoaded ? 'loading' : ''}`}>
        <img 
          src={imageSrc}
          alt={`${trailer.year} ${trailer.make} ${trailer.model}`} 
          className="trailer-image-img"
          onError={handleImageLoadError}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          crossOrigin="anonymous"
        />
        {trailer.status && (
          <div className={`status-badge ${getStatusClass(trailer.status)}`}>
            {trailer.status}
          </div>
        )}
      </div>
      
      <div className="trailer-info">
        <h3 className="trailer-title">
          {trailer.year || 'N/A'} {trailer.make || ''} {trailer.model || ''}
        </h3>
        
        <div className="trailer-attributes">
          {trailer.price !== undefined && (
            <div className="attribute">
              <span className="attribute-label">Price:</span>
              <span className="attribute-value trailer-price">{formattedPrice}</span>
            </div>
          )}
          
          {trailer.type && (
            <div className="attribute">
              <span className="attribute-label">Type:</span>
              <span className="attribute-value">{trailer.type}</span>
            </div>
          )}
          
          {trailer.length !== undefined && trailer.length !== null && (
            <div className="attribute">
              <span className="attribute-label">Length:</span>
              <span className="attribute-value">{trailer.length} ft</span>
            </div>
          )}
          
          {trailer.axles !== undefined && trailer.axles !== null && (
            <div className="attribute">
              <span className="attribute-label">Axles:</span>
              <span className="attribute-value">{trailer.axles}</span>
            </div>
          )}
          
          {trailer.location && (
            <div className="attribute">
              <span className="attribute-label">Location:</span>
              <span className="attribute-value">{trailer.location}</span>
            </div>
          )}
        </div>
        
        {/* View Details Button for Mobile */}
        <div className="mobile-view-details-btn">
          View Details 
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

TrailerCard.propTypes = {
  trailer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    make: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.number,
    type: PropTypes.string,
    status: PropTypes.string,
    imageUrl: PropTypes.string,
    imageData: PropTypes.string,
    images: PropTypes.array,
    imagesData: PropTypes.array,
    price: PropTypes.number,
    length: PropTypes.number,
    axles: PropTypes.number,
    description: PropTypes.string,
    location: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  viewMode: PropTypes.string
};

TrailerCard.defaultProps = {
  viewMode: 'grid'
};

export default TrailerCard;