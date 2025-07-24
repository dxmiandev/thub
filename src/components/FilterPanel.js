import React from 'react';

const FilterPanel = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className="filter-panel">
      <select 
        name="make" 
        value={filters.make}
        onChange={handleChange}
      >
        <option value="">All Makes</option>
        <option value="Volvo">Volvo</option>
        <option value="Freightliner">Freightliner</option>
        <option value="Kenworth">Kenworth</option>
      </select>
      
      <input
        type="number"
        name="minPrice"
        placeholder="Min Price"
        value={filters.minPrice}
        onChange={handleChange}
      />
      
      <input
        type="number"
        name="maxPrice"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={handleChange}
      />
    </div>
  );
};

export default FilterPanel;