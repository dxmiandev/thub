// src/App.js
import React, { useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar'; 
import Home from './pages/Home'; 
import Trucks from './pages/Trucks';
import Trailers from './pages/Trailers';
import Login from './pages/Login';
import Register from './pages/Register';
import Plans from './pages/Plans';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { TruckProvider } from './context/TruckContext';
import { TrailerProvider } from './context/TrailerContext';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import NewTruck from './pages/NewTruck'; 
import NewTrailer from './pages/NewTrailer';
import TruckDetails from './pages/TruckDetails';
import TrailerDetails from './pages/TrailerDetails';
import Search from './pages/Search';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);

    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <TruckProvider>
            <TrailerProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/trucks" element={<Trucks />} />
                <Route path="/trailers" element={<Trailers />} />
                <Route path="/trucks/:id" element={<TruckDetails />} />
                <Route path="/trailers/:id" element={<TrailerDetails />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/trucks" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/trailers" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/trucks/new" element={
                  <ProtectedRoute requiredRole={['seller', 'dealer', 'admin']}>
                    <NewTruck />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/trailers/new" element={
                  <ProtectedRoute requiredRole={['seller', 'dealer', 'admin']}>
                    <NewTrailer />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/trucks/:id" element={
                  <ProtectedRoute>
                    <TruckDetails />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/trailers/:id" element={
                  <ProtectedRoute>
                    <TrailerDetails />
                  </ProtectedRoute>
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </TrailerProvider>
          </TruckProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App; // <-- Make sure this line exists at the end