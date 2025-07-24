import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure API base URL
const API_BASE_URL = 'https://backend-sigy.onrender.com';

// Create the context
export const TrailerContext = createContext(); 

// Custom hook to use the trailer context
export const useTrailers = () => useContext(TrailerContext);

// Provider component
export const TrailerProvider = ({ children }) => {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedTrailers, setSavedTrailers] = useState([]);

  // Load saved trailers from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('savedTrailers');
    if (saved) {
      setSavedTrailers(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever savedTrailers changes
  useEffect(() => {
    localStorage.setItem('savedTrailers', JSON.stringify(savedTrailers));
  }, [savedTrailers]);

  // Function to fetch trailers from the API
  const getTrailers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trailers`);
      setTrailers(response.data?.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trailers. Please try again later.');
      console.error('Error fetching trailers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new trailer
  const addTrailer = (newTrailer) => {
    setTrailers(prevTrailers => {
      if (!Array.isArray(prevTrailers)) {
        return [newTrailer]; // If trailers is not an array, initialize it with the new trailer
      }
      return [...prevTrailers, newTrailer]; // Append the new trailer to the existing array
    });
  };

  // Function to update an existing trailer
  const updateTrailer = (updatedTrailer) => {
    setTrailers(prevTrailers => 
      prevTrailers.map(trailer => 
        trailer._id === updatedTrailer._id ? updatedTrailer : trailer
      )
    );
  };

  // Function to delete a trailer
  const deleteTrailer = (trailerId) => {
    setTrailers(prevTrailers => prevTrailers.filter(trailer => trailer._id !== trailerId));
    // Also remove from saved trailers if it was saved
    setSavedTrailers(prev => prev.filter(id => id !== trailerId));
  };

  // Function to toggle saving/unsaving a trailer
  const toggleSaveTrailer = (trailerId) => {
    setSavedTrailers(prev => 
      prev.includes(trailerId) 
        ? prev.filter(id => id !== trailerId) 
        : [...prev, trailerId]
    );
  };

  // Provide the context value to children components
  const value = {
    trailers,
    loading,
    error,
    getTrailers,
    addTrailer,
    updateTrailer,
    deleteTrailer,
    savedTrailers,
    toggleSaveTrailer
  };

  return (
    <TrailerContext.Provider value={value}>
      {children}
    </TrailerContext.Provider>
  );
}; 