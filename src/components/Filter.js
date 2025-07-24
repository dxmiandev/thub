import React from 'react';
import { motion } from 'framer-motion';
import './Filter.css'; // Import the CSS file

const Filter = ({ filter, setFilter }) => {
  const handleChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <motion.div
      className="filter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <input
        type="text"
        name="brand"
        placeholder="Brand"
        value={filter.brand}
        onChange={handleChange}
      />
      <input
        type="text"
        name="model"
        placeholder="Model"
        value={filter.model}
        onChange={handleChange}
      />
    </motion.div>
  );
};

export default Filter;
