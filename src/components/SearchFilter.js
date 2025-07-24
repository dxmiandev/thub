import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchFilter.css';

const SearchFilter = ({ value, onChange, placeholder = "Search..." }) => {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search trucks"
        />
        {value && (
          <button 
            onClick={handleClear} 
            className="clear-button"
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;