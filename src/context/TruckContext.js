import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure API base URL
const API_BASE_URL = 'https://backend-sigy.onrender.com';

// Create the context
export const TruckContext = createContext(); 

// Custom hook to use the truck context
export const useTrucks = () => useContext(TruckContext);

// Provider component
export const TruckProvider = ({ children }) => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedTrucks, setSavedTrucks] = useState([]);

  // Load saved trucks from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('savedTrucks');
    if (saved) {
      setSavedTrucks(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever savedTrucks changes
  useEffect(() => {
    localStorage.setItem('savedTrucks', JSON.stringify(savedTrucks));
  }, [savedTrucks]);

  // Function to fetch trucks from the API
  const getTrucks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trucks`);
      setTrucks(response.data?.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trucks. Please try again later.');
      console.error('Error fetching trucks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new truck
  const addTruck = (newTruck) => {
    setTrucks(prevTrucks => {
      if (!Array.isArray(prevTrucks)) {
        return [newTruck]; // If trucks is not an array, initialize it with the new truck
      }
      return [...prevTrucks, newTruck]; // Append the new truck to the existing array
    });
  };

  // Function to update an existing truck
  const updateTruck = (updatedTruck) => {
    setTrucks(prevTrucks => 
      prevTrucks.map(truck => 
        truck._id === updatedTruck._id ? updatedTruck : truck
      )
    );
  };

  // Function to delete a truck
  const deleteTruck = (truckId) => {
    setTrucks(prevTrucks => prevTrucks.filter(truck => truck._id !== truckId));
    // Also remove from saved trucks if it was saved
    setSavedTrucks(prev => prev.filter(id => id !== truckId));
  };

  // Function to toggle saving/unsaving a truck
  const toggleSaveTruck = (truckId) => {
    setSavedTrucks(prev => 
      prev.includes(truckId) 
        ? prev.filter(id => id !== truckId) 
        : [...prev, truckId]
    );
  };

  // Provide the context value to children components
  const value = {
    trucks,
    loading,
    error,
    getTrucks,
    addTruck,
    updateTruck,
    deleteTruck,
    savedTrucks,
    toggleSaveTruck
  };

  return (
    <TruckContext.Provider value={value}>
      {children}
    </TruckContext.Provider>
  );
};