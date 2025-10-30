import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [mapSettings, setMapSettings] = useState({
    style: localStorage.getItem('mapStyle') || 'dark',
    showHeatmap: true,
    showHazards: true,
    showOfficialRoutes: true,
  });

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [conditions, setConditions] = useState({
    waterLevel: null,
    windSpeed: null,
    waveHeight: null,
    visibility: null,
    lastUpdated: null,
  });

  // Save map style to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mapStyle', mapSettings.style);
  }, [mapSettings.style]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const updateMapSettings = (updates) => {
    setMapSettings((prev) => ({ ...prev, ...updates }));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const updateConditions = (newConditions) => {
    setConditions({
      ...newConditions,
      lastUpdated: new Date().toISOString(),
    });
  };

  const value = {
    mapSettings,
    updateMapSettings,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    currentLocation,
    setCurrentLocation,
    conditions,
    updateConditions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
