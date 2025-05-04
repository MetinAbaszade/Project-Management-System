import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Create mock context providers if not available
const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = React.useState(false);
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode: () => setDarkMode(!darkMode) }}>
      {children}
    </ThemeContext.Provider>
  );
};

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{ user: { name: 'John Doe' }, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

// Try to import the real context providers, but if they don't exist, use the mock ones
let RealThemeProvider, RealAuthProvider;
try {
  const ThemeModules = require('./context/ThemeContext');
  const AuthModules = require('./context/AuthContext');
  RealThemeProvider = ThemeModules.ThemeProvider;
  RealAuthProvider = AuthModules.AuthProvider;
} catch (e) {
  console.warn('Could not import context providers, using fallbacks:', e);
  RealThemeProvider = ThemeProvider;
  RealAuthProvider = AuthProvider;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RealAuthProvider>
        <RealThemeProvider>
          <App />
        </RealThemeProvider>
      </RealAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);