import React, { createContext, useContext, useState, useEffect } from 'react';
import designTokens from './designTokens';

// Create theme context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  tokens: designTokens,
});

// Create custom hook for using the theme
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  // Check system preference and stored preference
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('color-theme');
      if (typeof storedTheme === 'string') {
        return storedTheme;
      }

      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    return 'light'; // Default theme
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Update theme in document and localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme class
    root.classList.remove('light', 'dark');
    // Add new theme class
    root.classList.add(theme);
    
    // Update localStorage
    localStorage.setItem('color-theme', theme);
  }, [theme]);

  // Update theme if system preference changes
  useEffect(() => {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('color-theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Create theme tokens based on current theme
  const tokens = {
    ...designTokens,
    currentTheme: theme,
  };

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;