import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthStyles.css';

const LoginPage = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  // Error handling
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  
  // Navigation and auth
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError } = useAuth();
  
  // Get message from location state (e.g., after registration)
  const message = location.state?.message || '';
  
  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  
  // Clear errors when inputs change
  useEffect(() => {
    if (email || password) {
      clearError();
    }
  }, [email, password, clearError]);
  
  // Email validation function
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      email: '',
      password: '',
      general: ''
    });
    
    // Validate inputs
    let hasError = false;
    
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      hasError = true;
    } else if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      hasError = true;
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      hasError = true;
    }
    
    if (hasError) return;
    
    try {
      setLoading(true);
      // Call login function from AuthContext
      await login(email, password);
      
      // Navigate to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done by the auth context
      console.error('Login error:', error);
      setLoading(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Navigate to registration page with animation
  const handleRegisterClick = () => {
    setIsActive(true);
    // Add delay before navigation to allow animation to complete
    setTimeout(() => {
      navigate('/signup');
    }, 800);
  };
  
  return (
    <div className="login-container">
      {/* TaskUp Logo */}
      <div className="auth-logo" onClick={() => navigate('/')}>
        <div className="logo"></div>
        <div className="logo-text">TaskUp</div>
      </div>
      
      {/* Main container */}
      <div className={`auth-container ${isActive ? 'active' : ''}`}>
        {/* Login Section */}
        <div className="login-section">
          <form className="auth-form" onSubmit={handleLogin}>
            <h1>Login</h1>
            <p>Welcome back! Please login to your account</p>
            
            {message && <div className="success-message">{message}</div>}
            {authError && <div className="error-message">{authError}</div>}
            
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <i className="bx bx-envelope"></i>
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
            
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <i className="bx bx-lock-alt"></i>
              <i 
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}
                onClick={togglePasswordVisibility}
              ></i>
              {errors.password && <div className="error">{errors.password}</div>}
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
              
              <Link to="/forgot-password" className="auth-link" style={{margin: '0'}}>
                Forgot password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
        
        {/* Register Section - Just a placeholder for animation */}
        <div className="register-section">
          <div className="auth-form">
            <h1>Registration</h1>
            <p>Create your account to get started</p>
            
            <div className="form-group">
              <input type="email" placeholder="Email" />
              <i className="bx bx-envelope"></i>
            </div>
            
            <button className="auth-btn">Register</button>
          </div>
        </div>
        
        {/* Blue Panel */}
        <div className="blue-panel">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account yet?</p>
          <button className="auth-btn" onClick={handleRegisterClick}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;