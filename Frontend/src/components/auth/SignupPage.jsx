import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

const SignupPage = () => {
  // Main state management
  const [step, setStep] = useState('email'); // 'email', 'otp', 'registration'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Error state
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  
  const navigate = useNavigate();
  
  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);
  
  // Validation functions
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return { minLength, hasUppercase, hasSpecialChar, valid: minLength && hasUppercase && hasSpecialChar };
  };
  
  // Form submission handlers
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      ...errors,
      email: '',
      general: ''
    });
    
    // Validate email
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    } else if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      // Reset timer for OTP
      setTimer(60);
      setCanResend(false);
    }, 1000);
  };
  
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-signup-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-signup-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      ...errors,
      otp: '',
      general: ''
    });
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter all 6 digits' }));
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('registration');
    }, 1000);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleCompleteRegistration = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      ...errors,
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      general: ''
    });
    
    let hasErrors = false;
    
    // Validate fields
    if (!formData.firstName.trim()) {
      setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
      hasErrors = true;
    }
    
    if (!formData.lastName.trim()) {
      setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
      hasErrors = true;
    }
    
    // Validate password
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      hasErrors = true;
    } else {
      const pwdValidation = validatePassword(formData.password);
      if (!pwdValidation.valid) {
        let passwordError = 'Password must contain:';
        if (!pwdValidation.minLength) passwordError += ' at least 8 characters,';
        if (!pwdValidation.hasUppercase) passwordError += ' an uppercase letter,';
        if (!pwdValidation.hasSpecialChar) passwordError += ' a special character,';
        
        setErrors(prev => ({ ...prev, password: passwordError.slice(0, -1) }));
        hasErrors = true;
      }
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to login with success message
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in with your credentials.' } 
      });
    }, 1000);
  };
  
  // Helper functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleResendOtp = () => {
    if (!canResend) return;
    
    setCanResend(false);
    setTimer(60);
    
    // Simulate API call to resend OTP
    console.log(`Resending OTP to ${email}`);
    // In a real app, you would call the API here
  };
  
  const handleLoginClick = () => {
    setIsActive(false);
    // Add delay before navigation to allow animation to complete
    setTimeout(() => {
      navigate('/login');
    }, 800);
  };
  
  // Render the appropriate form based on step
  const renderRegistrationContent = () => {
    switch(step) {
      case 'email':
        return (
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <h1>Registration</h1>
            <p>Create your account to get started</p>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            
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
            
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        );
        
      case 'otp':
        return (
          <form className="auth-form">
            <h1>Verify Email</h1>
            <p>We've sent a verification code to <strong>{email}</strong></p>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            {errors.otp && <div className="error-message">{errors.otp}</div>}
            
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-signup-${index}`}
                  className="otp-input"
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <button 
              type="button" 
              className="auth-btn" 
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <div className="resend-container">
              Didn't receive the code? 
              {canResend ? (
                <span className="resend-button" onClick={handleResendOtp}>
                  {' '}Resend now
                </span>
              ) : (
                <span className="resend-button disabled">
                  {' '}Resend in {timer}s
                </span>
              )}
            </div>
            
            <div className="back-button" onClick={() => setStep('email')}>
              Change email address
            </div>
          </form>
        );
        
      case 'registration':
        return (
          <form className="auth-form">
            <h1>Complete Profile</h1>
            <p>Just a few more details to finish</p>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <div className={`form-group ${errors.firstName ? 'has-error' : ''}`}>
              <input 
                type="text" 
                name="firstName"
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleInputChange}
                required 
              />
              <i className="bx bx-user"></i>
              {errors.firstName && <div className="error">{errors.firstName}</div>}
            </div>
            
            <div className={`form-group ${errors.lastName ? 'has-error' : ''}`}>
              <input 
                type="text" 
                name="lastName"
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleInputChange}
                required 
              />
              <i className="bx bx-user"></i>
              {errors.lastName && <div className="error">{errors.lastName}</div>}
            </div>
            
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleInputChange}
                required 
              />
              <i className="bx bx-lock-alt"></i>
              <i 
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}
                onClick={togglePasswordVisibility}
              ></i>
              {errors.password && <div className="error">{errors.password}</div>}
            </div>
            
            <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="confirmPassword"
                placeholder="Confirm Password" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required 
              />
              <i className="bx bx-lock-alt"></i>
              <i 
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}
                onClick={togglePasswordVisibility}
              ></i>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
            </div>
            
            <button 
              type="button" 
              className="auth-btn" 
              onClick={handleCompleteRegistration}
              disabled={loading}
            >
              {loading ? 'Completing...' : 'Complete Registration'}
            </button>
          </form>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="login-container">
      {/* TaskUp Logo */}
      <div className="auth-logo" onClick={() => navigate('/')}>
        <div className="logo"></div>
        <div className="logo-text">TaskUp</div>
      </div>
      
      <div className={`auth-container ${isActive ? 'active' : ''}`}>
        {/* Login Section - Just a placeholder for animation */}
        <div className="login-section">
          <div className="auth-form">
            <h1>Login</h1>
            <p>Welcome back! Please login to your account</p>
            
            <div className="form-group">
              <input type="email" placeholder="Email" />
              <i className="bx bx-envelope"></i>
            </div>
            
            <div className="form-group">
              <input type="password" placeholder="Password" />
              <i className="bx bx-lock-alt"></i>
            </div>
            
            <a href="#" className="auth-link">Forgot password?</a>
            
            <button className="auth-btn">Login</button>
          </div>
        </div>
        
        {/* Registration Section - Changes based on step */}
        <div className="register-section">
          {renderRegistrationContent()}
        </div>
        
        {/* Blue Panel */}
        <div className="blue-panel">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="auth-btn" onClick={handleLoginClick}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;