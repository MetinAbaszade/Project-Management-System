import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

const ForgotPassword = () => {
  // Main states
  const [step, setStep] = useState('request'); // 'request', 'verification', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  
  const navigate = useNavigate();
  
  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'verification' && timer > 0) {
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
  const handleRequestReset = (e) => {
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
      setStep('verification');
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
      const nextInput = document.getElementById(`otp-reset-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-reset-${index - 1}`);
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
      setStep('reset');
    }, 1000);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleResetPassword = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      ...errors,
      password: '',
      confirmPassword: '',
      general: ''
    });
    
    const { newPassword, confirmPassword } = passwords;
    let hasErrors = false;
    
    // Validate password
    if (!newPassword) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      hasErrors = true;
    } else {
      const pwdValidation = validatePassword(newPassword);
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
    if (newPassword !== confirmPassword) {
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
        state: { message: 'Password reset successful! Please log in with your new password.' } 
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
  
  // Render appropriate form based on current step
  const renderForm = () => {
    switch(step) {
      case 'request':
        return (
          <div className="auth-form">
            <h1>Reset Password</h1>
            <p>Enter your email to receive a verification code</p>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <i className="bx bx-envelope"></i>
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
            
            <button 
              type="button" 
              className="auth-btn" 
              onClick={handleRequestReset}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '20px'}}>
              <Link to="/login" style={{color: '#7b7ff6', textDecoration: 'none', fontSize: '14px'}}>
                Back to Login
              </Link>
            </div>
          </div>
        );
        
      case 'verification':
        return (
          <div className="auth-form">
            <h1>Verify Email</h1>
            <p>We've sent a verification code to <strong>{email}</strong></p>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            {errors.otp && <div className="error-message">{errors.otp}</div>}
            
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-reset-${index}`}
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
            
            <div className="back-button" onClick={() => setStep('request')}>
              Change email address
            </div>
          </div>
        );
        
      case 'reset':
        return (
          <div className="auth-form">
            <h1>Create New Password</h1>
            <p>Your password must be different from previous ones</p>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="newPassword"
                placeholder="New Password" 
                value={passwords.newPassword}
                onChange={handlePasswordChange}
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
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
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
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
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
      
      <div className="forgot-container">
        {renderForm()}
      </div>
    </div>
  );
};

export default ForgotPassword;