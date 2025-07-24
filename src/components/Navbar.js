import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  FiTruck, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiGlobe, 
  FiLogOut, 
  FiActivity,
  FiChevronDown,
  FiHome,
  FiInfo,
  FiMail,
  FiTag
} from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";
import logo from '../pages/assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, languages, translate } = useLanguage();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  // Force re-render when language changes
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    // Force component re-render when language changes
    forceUpdate({});
  }, [language]);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close language dropdown when clicking outside
      if (languageDropdownOpen && !event.target.closest('.language-selector-container')) {
        setLanguageDropdownOpen(false);
      }
      
      // Close mobile menu when clicking outside (but not on the toggle button)
      if (mobileMenuOpen && !event.target.closest('.mobile-menu') && 
          !event.target.closest('.menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    // Close on escape key
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (languageDropdownOpen) setLanguageDropdownOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [languageDropdownOpen, mobileMenuOpen]);

  const handleLanguageChange = (langCode) => {
    console.log('Changing language to:', langCode);
    setLanguage(langCode);
    setLanguageDropdownOpen(false);
    
    // Force component re-render
    setTimeout(() => {
      forceUpdate({});
    }, 100);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  // Manage scroll state and apply to body
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 20) {
        setScrolled(true);
        document.body.classList.add('scrolled');
      } else {
        setScrolled(false);
        document.body.classList.remove('scrolled');
      }
    };

    // Initialize scroll state
    if (window.scrollY > 20) {
      setScrolled(true);
      document.body.classList.add('scrolled');
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('scrolled');
    };
  }, []);

  // Lock body scroll when mobile menu is open - FIXED
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Get current language info
  const currentLanguage = languages?.find(lang => lang.code === language) || languages?.[0];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} white-navbar`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="logo-link">
            <img src={logo} alt="T&T Hub Logo" className="logo-img" style={{height: '38px', width: 'auto', marginRight: '10px'}} />
          </Link>

          {/* Desktop Navigation */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {translate ? translate("Home") : "Home"}
              </NavLink>
            </li>
            <li>
              <NavLink to="/trucks" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {translate ? translate("Trucks") : "Trucks"}
              </NavLink>
            </li>
            <li>
              <NavLink to="/trailers" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {translate ? translate("Trailers") : "Trailers"}
              </NavLink>
            </li>
            <li>
              <NavLink to="/plans" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {translate ? translate("Plans") : "Plans"}
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {translate ? translate("About Us") : "About Us"}
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {translate ? translate("Contact") : "Contact"}
              </NavLink>
            </li>
          </ul>

          {/* Right Side Actions */}
          <div className="right-actions">
            {/* Language Selector - Desktop */}
            <div className="language-selector-container desktop-only">
              <button 
                className="language-selector"
                onClick={toggleLanguageDropdown}
                aria-label="Select language"
                aria-expanded={languageDropdownOpen}
              >
                <FiGlobe className="language-icon" />
                <span className="language-code">
                  {currentLanguage?.flag || '🌐'}
                </span>
                <FiChevronDown className={`dropdown-arrow ${languageDropdownOpen ? 'open' : ''}`} />
              </button>
              
              {languageDropdownOpen && (
                <div className="language-dropdown">
                  {languages?.map((lang) => (
                    <button
                      key={lang.code}
                      className={`language-option ${language === lang.code ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span className="language-flag">{lang.flag}</span>
                      <span className="language-name">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="auth-buttons-container desktop-only">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="nav-btn btn-dashboard">
                    <FiActivity className="btn-icon" />
                    <span className="btn-text">
                      {translate ? translate("Dashboard") : "Dashboard"}
                    </span>
                  </Link>
                  <button className="nav-btn btn-logout" onClick={handleLogout}>
                    <FiLogOut className="btn-icon" />
                    <span className="btn-text">
                      {translate ? translate("Logout") : "Logout"}
                    </span>
                  </button>
                </>
              ) : (
                <Link to="/signin" className="nav-btn btn-login">
                  <FiUser className="btn-icon" />
                  <span className="btn-text">
                    {translate ? translate("Sign In") : "Sign In"}
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - FIXED */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay active" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - FIXED */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">
            {translate ? translate("Navigation") : "Navigation"}
          </span>
          <button 
            className="mobile-menu-close" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>
        
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              <FiHome className="mobile-nav-icon" />
              {translate ? translate("Home") : "Home"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/trucks" onClick={() => setMobileMenuOpen(false)}>
              <FiTruck className="mobile-nav-icon" />
              {translate ? translate("Trucks") : "Trucks"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/trailers" onClick={() => setMobileMenuOpen(false)}>
              <FiTruck className="mobile-nav-icon" />
              {translate ? translate("Trailers") : "Trailers"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/plans" onClick={() => setMobileMenuOpen(false)}>
              <FiTag className="mobile-nav-icon" />
              {translate ? translate("Plans") : "Plans"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
              <FiInfo className="mobile-nav-icon" />
              {translate ? translate("About Us") : "About Us"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>
              <FiMail className="mobile-nav-icon" />
              {translate ? translate("Contact") : "Contact"}
            </NavLink>
          </li>
        </ul>

        <div className="mobile-nav-actions">
          <h3 className="mobile-section-title">
            {translate ? translate("Language") : "Language"}
          </h3>
          <div className="mobile-language-selector">
            <div className="mobile-language-options">
              {languages?.map((lang) => (
                <button
                  key={lang.code}
                  className={`mobile-language-option ${language === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    handleLanguageChange(lang.code);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span className="language-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <h3 className="mobile-section-title">
            {translate ? translate("Account") : "Account"}
          </h3>
          <div className="mobile-auth-section">
            <div className="auth-buttons-container">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="nav-btn btn-dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <FiActivity className="btn-icon" />
                    <span className="btn-text">
                      {translate ? translate("Dashboard") : "Dashboard"}
                    </span>
                  </Link>
                  <button className="nav-btn btn-logout" onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}>
                    <FiLogOut className="btn-icon" />
                    <span className="btn-text">
                      {translate ? translate("Logout") : "Logout"}
                    </span>
                  </button>
                </>
              ) : (
                <Link to="/signin" className="nav-btn btn-login" onClick={() => setMobileMenuOpen(false)}>
                  <FiUser className="btn-icon" />
                  <span className="btn-text">
                    {translate ? translate("Sign In") : "Sign In"}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;