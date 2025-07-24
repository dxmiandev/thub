import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrucks } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from './LoadingSpinner';
import './ExploreSection.css';
import { API_URL } from '../config';
import { DEFAULT_PLACEHOLDERS, getFullImageUrl, handleImageError } from '../utils/imageHelper';

const ExploreSection = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 767);
  const sliderRef = useRef(null);

  // Calculate how many trucks to display at once based on screen size
  const trucksPerView = useMemo(() => {
    if (isMobileView) {
      return 1;
    } else if (window.innerWidth <= 1023) {
      return 2;
    } else {
      return 3;
    }
  }, [isMobileView]);

  // Update mobile view state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch trucks data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Limit the number of trucks based on view mode
        const response = await fetchTrucks({ limit: isMobileView ? 5 : 9 });
        
        if (response.success && response.data) {
          console.log('ExploreSection received truck data:', response.data.length, 'trucks');
          setTrucks(response.data);
          setError(null);
        } else {
          console.error('ExploreSection - API returned unsuccessfully:', response.error);
          setError('Failed to load trucks data properly.');
        }
      } catch (err) {
        console.error('Error fetching trucks in ExploreSection:', err);
        setError('Failed to load trucks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isMobileView]);

  // Handle slide transitions
  const handleNext = useCallback(() => {
    if (currentIndex < trucks.length - trucksPerView) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, trucks.length, trucksPerView]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  // Update slider transform whenever the index changes
  useEffect(() => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.offsetWidth / trucksPerView;
      sliderRef.current.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
  }, [currentIndex, trucksPerView]);

  // Render pagination dots
  const renderPagination = () => {
    if (trucks.length <= trucksPerView) return null;
    
    const pages = Math.ceil(trucks.length / trucksPerView);
    const dots = [];
    
    for (let i = 0; i < pages; i++) {
      dots.push(
        <div
          key={i}
          className={`paginationDot ${Math.floor(currentIndex / trucksPerView) === i ? 'active' : ''}`}
          onClick={() => setCurrentIndex(i * trucksPerView)}
        />
      );
    }
    
    return <div className="pagination">{dots}</div>;
  };

  // Render truck cards
  const renderTruckCards = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <LoadingSpinner size="medium" />
          <p>Loading trucks...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="no-trucks-message">
          <div className="icon">❌</div>
          <h3>Oops! Something went wrong</h3>
          <p className="subtitle">{error}</p>
        </div>
      );
    }

    if (!trucks || trucks.length === 0) {
      return (
        <div className="no-trucks-message">
          <div className="icon">🚚</div>
          <h3>No trucks available</h3>
          <p className="subtitle">Check back soon for new additions!</p>
        </div>
      );
    }

    console.log('Rendering truck cards:', trucks.length);

    return trucks.map((truck, index) => {
      // Determine the correct image source with proper fallbacks
      let imageSrc = DEFAULT_PLACEHOLDERS.card;
      
      try {
        // Debug logging to see what's available
        console.log(`Truck #${index} image sources:`, {
          id: truck._id || truck.id,
          images: truck.images,
          imageUrl: truck.imageUrl,
          image: truck.image
        });

        // Check for images array (primary source)
        if (truck.images && truck.images.length > 0) {
          imageSrc = `${API_URL}/uploads/${truck.images[0]}`;
          console.log('Using images[0]:', imageSrc);
        } 
        // Check for imageUrl field (secondary source)
        else if (truck.imageUrl) {
          // Determine if imageUrl is absolute or relative
          if (truck.imageUrl.startsWith('http://') || truck.imageUrl.startsWith('https://')) {
            imageSrc = truck.imageUrl;
          } else {
            // Ensure proper path for relative URLs
            const path = truck.imageUrl.startsWith('/') ? truck.imageUrl : `/${truck.imageUrl}`;
            imageSrc = `${API_URL}${path}`;
          }
          console.log('Using imageUrl:', imageSrc);
        }
        // Check for image field (tertiary source)
        else if (truck.image) {
          const path = truck.image.startsWith('/') ? truck.image : `/${truck.image}`;
          imageSrc = `${API_URL}${path}`;
          console.log('Using image:', imageSrc);
        }
      } catch (err) {
        console.error('Error processing image for truck:', truck._id || truck.id, err);
        imageSrc = DEFAULT_PLACEHOLDERS.card;
      }

      const truckId = truck._id || truck.id;
      const truckTitle = truck.title || `${truck.year || ''} ${truck.make || ''} ${truck.model || ''}`.trim();

  return (
        <div className="card" key={truckId || index}>
                    <div className="imageWrapper">
                      <img 
              src={imageSrc}
              alt={truckTitle} 
              className="image optimized-image"
                        loading="lazy" 
                        onError={(e) => {
                console.error(`Image load failed for truck ${truckId}:`, e.target.src);
                e.target.src = DEFAULT_PLACEHOLDERS.card;
                        }}
                      />
                      <div className="cardBadges">
              {truck.isNew && (
                        <span className="badge badgeNew">
                  <span className="icon-clock"></span>New
                        </span>
              )}
                        {truck.status && (
                <span className={`badge badge${truck.status}`}>
                            {truck.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="cardContent">
                      <div>
              <h3 className="cardTitle">{truckTitle}</h3>
              <p className="cardDescription">{truck.description || truck.notes || 'No description available'}</p>
                        <ul className="cardDetails">
                {truck.year && (
                            <li className="detail">
                    <span className="detailIcon">📅</span>
                    {truck.year}
                            </li>
                          )}
                {truck.mileage && (
                            <li className="detail">
                    <span className="detailIcon">🛣️</span>
                    {truck.mileage.toLocaleString()} mi
                            </li>
                          )}
                {truck.engine && (
                            <li className="detail">
                    <span className="detailIcon">⚙️</span>
                    {truck.engine}
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="cardFooter">
                        <div className="priceContainer">
                          <span className="priceTag">Price</span>
                <span className="price">{formatCurrency(truck.price)}</span>
                        </div>
              <Link to={`/trucks/${truckId}`} className="viewDetails">
                Details
                <span className="viewDetailsIcon">→</span>
              </Link>
                      </div>
                    </div>
                  </div>
      );
    });
  };

  return (
    <section className="exploreSection">
      <div className="container">
        <div className="header">
          <div>
            <h2 className="title">Explore Our Trucks</h2>
            <p className="subtitle">Find the perfect truck for your hauling needs</p>
          </div>
          <Link to="/trucks" className={isMobileView ? "hidden" : "viewAll"}>
            View All Trucks
            <span className="viewAllIcon">→</span>
          </Link>
              </div>

        <div className="sliderContainer">
                  <button 
            className={`arrow arrowLeft ${currentIndex === 0 ? 'disabled' : ''}`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
                  </button>
          
          <div 
            className="slider" 
            ref={sliderRef}
          >
            {renderTruckCards()}
          </div>
          
                  <button 
            className={`arrow arrowRight ${currentIndex >= trucks.length - trucksPerView ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={currentIndex >= trucks.length - 1}
            aria-label="Next"
          >
                  </button>
            </div>
            
        {renderPagination()}
        
        {isMobileView && (
          <div className="mobile-view-all">
            <Link to="/trucks" className="viewAll">
              View All Trucks
              <span className="viewAllIcon">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreSection;