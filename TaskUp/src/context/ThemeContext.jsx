import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user previously set a theme preference or use system preference
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPreference = window.localStorage.getItem('theme');
      if (typeof storedPreference === 'string') {
        return storedPreference === 'dark';
      }
      
      // Check system preference
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    
    // Default to light theme
    return false;
  };
  
  const [darkMode, setDarkMode] = useState(getInitialTheme);
  
  // Update localStorage and document class when theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    // Apply class to document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Update theme if system preference changes
  useEffect(() => {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setDarkMode(mediaQuery.matches);
      }
    };
    
    // Use the correct event listener based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};