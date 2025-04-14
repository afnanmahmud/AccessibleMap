import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  const navigate = useNavigate();

  // Update window dimensions on resize or orientation change
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Add CSS keyframes for spinner animation
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Determine if we're on mobile
  const isMobile = windowWidth < 768;
  // Check if device is in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  const handleBackToMap = () => {
    navigate('/map');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear success message when user starts typing again
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset errors and messages
    setErrors({});
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/signup', {
        email: formData.email,
        first_name: formData.firstName, // Using snake_case to match backend expectations
        last_name: formData.lastName,
        password: formData.password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Handle successful signup
      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // Clear form data
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
      });
      
      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          setErrors({ email: 'User with this email already exists' });
        } else {
          setErrors({ general: error.response.data?.error || 'An error occurred during signup' });
        }
      } else {
        setErrors({ general: 'Network error. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Responsive styles
  const styles: Record<string, React.CSSProperties> = {
    outerContainer: {
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      padding: isMobile ? (isLandscape ? '15px' : '20px') : '40px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-top, 0px))`,
      paddingBottom: `max(20px, env(safe-area-inset-bottom, 0px))`,
      paddingLeft: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-left, 0px))`,
      paddingRight: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-right, 0px))`,
    },
    backButton: {
      position: isMobile ? 'relative' : 'absolute',
      top: isMobile ? 'auto' : '40px',
      left: isMobile ? 'auto' : '40px',
      alignSelf: isMobile ? 'flex-start' : 'auto',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '8px 15px' : '10px 20px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#f9fafb',
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: isMobile ? '14px' : '16px',
      marginBottom: isMobile ? '30px' : '0',
      cursor: 'pointer',
      outline: 'none',
      transition: 'box-shadow 0.2s, transform 0.1s',
    },
    backButtonFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    backArrow: {
      marginRight: '8px'
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '460px',
      width: '100%',
      margin: '0 auto',
      marginTop: isMobile ? (isLandscape ? '10px' : '20px') : '120px'
    },
    header: {
      fontSize: isMobile ? (isLandscape ? '26px' : '30px') : '38px',
      fontWeight: 'normal',
      color: '#374151',
      marginBottom: isMobile ? (isLandscape ? '20px' : '30px') : '50px',
      textAlign: 'center' as const
    },
    formGroup: {
      marginBottom: '15px',
      width: '100%'
    },
    inputWrapper: {
      position: 'relative',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#f9fafb',
    },
    inputWrapperError: {
      border: '1px solid #ef4444',
    },
    icon: {
      padding: '0 10px',
      color: '#6b7280',
      fontSize: '18px',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '12px 10px',
      paddingLeft: '5px',
      fontSize: isMobile ? '14px' : '16px',
      border: 'none',
      backgroundColor: '#f9fafb',
      borderRadius: '0 6px 6px 0',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'box-shadow 0.2s',
    },
    inputFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
    },
    checkmark: {
      position: 'absolute',
      right: '10px',
      color: '#10b981',
    },
    errorText: {
      color: '#ef4444',
      textAlign: 'left',
      marginBottom: '10px',
      fontSize: isMobile ? '12px' : '14px',
    },
    submitButton: {
      width: isMobile ? '100%' : '200px',
      padding: '12px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      marginBottom: isMobile ? (isLandscape ? '20px' : '30px') : '50px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
      opacity: isLoading ? 0.7 : 1,
      pointerEvents: isLoading ? 'none' : 'auto',
      outline: 'none',
      transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
    },
    submitButtonFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    submitButtonHover: {
      backgroundColor: '#1d4ed8',
    },
    submitButtonActive: {
      transform: 'translateY(1px)',
    },
    altLoginText: {
      color: '#6b7280',
      marginBottom: '10px',
      fontSize: isMobile ? '14px' : '16px',
      textAlign: 'center' as const
    },
    ksuButton: {
      width: isMobile ? '100%' : '200px',
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      color: '#4b5563',
      fontSize: isMobile ? '14px' : '16px',
      cursor: 'pointer',
      marginBottom: isMobile ? (isLandscape ? '20px' : '30px') : '50px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
      outline: 'none',
      transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
    },
    ksuButtonFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    ksuButtonHover: {
      backgroundColor: '#f3f4f6',
    },
    ksuButtonActive: {
      transform: 'translateY(1px)',
    },
    signInContainer: {
      textAlign: 'center' as const,
      width: '100%'
    },
    signInText: {
      color: '#6b7280',
      fontSize: isMobile ? '14px' : '16px'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: 'bold',
      outline: 'none',
      transition: 'color 0.2s, box-shadow 0.2s',
    },
    linkFocus: {
      textDecoration: 'underline',
      color: '#1d4ed8',
    },
    successMessage: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '20px',
      width: '100%',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successIcon: {
      marginRight: '8px',
      fontSize: '16px',
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '20px',
      width: '100%',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorIcon: {
      marginRight: '8px',
      fontSize: '16px',
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '16px',
      height: '16px',
      marginRight: '8px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.outerContainer}>
      {isMobile ? (
        <div style={styles.contentContainer}>
          {/* Back button */}
          <button
            onClick={handleBackToMap}
            style={{
              ...styles.backButton,
              ...(focusedElement === 'backBtn' ? styles.backButtonFocus : {})
            }}
            onFocus={() => setFocusedElement('backBtn')}
            onBlur={() => setFocusedElement(null)}
          >
            <span style={styles.backArrow}>◀</span>
            Back to Map
          </button>
          
          {/* Signup header */}
          <h1 style={styles.header}>Sign Up</h1>
          
          {/* Success Message */}
          {successMessage && (
            <div style={styles.successMessage}>
              <span style={styles.successIcon}>✓</span>
              {successMessage}
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>⚠️</span>
              {errors.general}
            </div>
          )}
          
          {/* Signup form */}
          <form style={{width: '100%'}} onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div style={styles.formGroup}>
              <div style={{
                ...styles.inputWrapper,
                ...(errors.email ? styles.inputWrapperError : {})
              }}>
                <span style={styles.icon}>✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'email' ? styles.inputFocus : {})
                  }}
                  onFocus={() => setFocusedElement('email')}
                  onBlur={() => setFocusedElement(null)}
                  disabled={isLoading}
                  aria-label="Email"
                  autoComplete="email"
                />
              </div>
              {errors.email && <div style={styles.errorText}>{errors.email}</div>}
            </div>
            
            {/* First Name Field */}
            <div style={styles.formGroup}>
              <div style={{
                ...styles.inputWrapper,
                ...(errors.firstName ? styles.inputWrapperError : {})
              }}>
                <span style={styles.icon}>👤</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'firstName' ? styles.inputFocus : {})
                  }}
                  onFocus={() => setFocusedElement('firstName')}
                  onBlur={() => setFocusedElement(null)}
                  disabled={isLoading}
                  aria-label="First Name"
                  autoComplete="given-name"
                />
              </div>
              {errors.firstName && <div style={styles.errorText}>{errors.firstName}</div>}
            </div>
            
            {/* Last Name Field */}
            <div style={styles.formGroup}>
              <div style={{
                ...styles.inputWrapper,
                ...(errors.lastName ? styles.inputWrapperError : {})
              }}>
                <span style={styles.icon}>👤</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'lastName' ? styles.inputFocus : {})
                  }}
                  onFocus={() => setFocusedElement('lastName')}
                  onBlur={() => setFocusedElement(null)}
                  disabled={isLoading}
                  aria-label="Last Name"
                  autoComplete="family-name"
                />
              </div>
              {errors.lastName && <div style={styles.errorText}>{errors.lastName}</div>}
            </div>
            
            {/* Password Field */}
            <div style={styles.formGroup}>
              <div style={{
                ...styles.inputWrapper,
                ...(errors.password ? styles.inputWrapperError : {})
              }}>
                <span style={styles.icon}>🔒</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'password' ? styles.inputFocus : {})
                  }}
                  onFocus={() => setFocusedElement('password')}
                  onBlur={() => setFocusedElement(null)}
                  disabled={isLoading}
                  aria-label="Password"
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <div style={styles.errorText}>{errors.password}</div>}
            </div>
            
            {/* Confirm Password Field */}
            <div style={styles.formGroup}>
              <div style={{
                ...styles.inputWrapper,
                ...(errors.confirmPassword ? styles.inputWrapperError : {})
              }}>
                <span style={styles.icon}>🔒</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'confirmPassword' ? styles.inputFocus : {})
                  }}
                  onFocus={() => setFocusedElement('confirmPassword')}
                  onBlur={() => setFocusedElement(null)}
                  disabled={isLoading}
                  aria-label="Confirm Password"
                  autoComplete="new-password"
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <span style={styles.checkmark}>✓</span>
                )}
              </div>
              {errors.confirmPassword && <div style={styles.errorText}>{errors.confirmPassword}</div>}
            </div>
            
            {/* Sign Up Button */}
            <div style={{width: '100%', textAlign: 'center' as const, marginTop: '20px'}}>
              <button
                type="submit" 
                style={{
                  ...styles.submitButton,
                  ...(focusedElement === 'submitBtn' ? styles.submitButtonFocus : {})
                }}
                disabled={isLoading}
                onFocus={() => setFocusedElement('submitBtn')}
                onBlur={() => setFocusedElement(null)}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 
                      (styles.submitButtonHover as any).backgroundColor;
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      (styles.submitButton as any).backgroundColor;
                  }
                }}
                onMouseDown={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.transform =
                      (styles.submitButtonActive as any).transform;
                  }
                }}
                onMouseUp={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.transform = 'none';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <span style={styles.loadingSpinner}></span>
                    Signing up...
                  </>
                ) : 'Sign up'}
              </button>
            </div>
          </form>
          
          {/* Alternative signup */}
          <p style={styles.altLoginText}>Or sign up with</p>
          <button 
            style={{
              ...styles.ksuButton,
              ...(focusedElement === 'ksuBtn' ? styles.ksuButtonFocus : {})
            }}
            disabled={isLoading}
            onFocus={() => setFocusedElement('ksuBtn')}
            onBlur={() => setFocusedElement(null)}
            onMouseOver={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = 
                  (styles.ksuButtonHover as any).backgroundColor;
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  (styles.ksuButton as any).backgroundColor;
              }
            }}
            onMouseDown={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.transform =
                  (styles.ksuButtonActive as any).transform;
              }
            }}
            onMouseUp={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.transform = 'none';
              }
            }}
          >
            KSU NetID
          </button>
          
          {/* Sign in link */}
          <div style={styles.signInContainer}>
            <p style={styles.signInText}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{
                  ...styles.link,
                  ...(focusedElement === 'signInLink' ? styles.linkFocus : {})
                }}
                onFocus={() => setFocusedElement('signInLink')}
                onBlur={() => setFocusedElement(null)}
                onMouseOver={(e) => {
                  (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLAnchorElement).style.textDecoration = 'none';
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Back to Map button - absolutely positioned for desktop */}
          <button 
            onClick={handleBackToMap}
            style={{
              ...styles.backButton,
              ...(focusedElement === 'backBtn' ? styles.backButtonFocus : {})
            }}
            onFocus={() => setFocusedElement('backBtn')}
            onBlur={() => setFocusedElement(null)}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
            }}
          >
            <span style={styles.backArrow}>◀</span>
            Back to Map
          </button>
          
          {/* Centered content */}
          <div style={styles.contentContainer}>
            {/* Signup header */}
            <h1 style={styles.header}>Sign Up</h1>
            
            {/* Success Message */}
            {successMessage && (
              <div style={styles.successMessage}>
                <span style={styles.successIcon}>✓</span>
                {successMessage}
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span>
                {errors.general}
              </div>
            )}
            
            {/* Signup form */}
            <form style={{width: '100%'}} onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div style={styles.formGroup}>
                <div style={{
                  ...styles.inputWrapper,
                  ...(errors.email ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.icon}>✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'email' ? styles.inputFocus : {})
                    }}
                    onFocus={() => setFocusedElement('email')}
                    onBlur={() => setFocusedElement(null)}
                    disabled={isLoading}
                    aria-label="Email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <div style={styles.errorText}>{errors.email}</div>}
              </div>
              
              {/* First Name Field */}
              <div style={styles.formGroup}>
                <div style={{
                  ...styles.inputWrapper,
                  ...(errors.firstName ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.icon}>👤</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'firstName' ? styles.inputFocus : {})
                    }}
                    onFocus={() => setFocusedElement('firstName')}
                    onBlur={() => setFocusedElement(null)}
                    disabled={isLoading}
                    aria-label="First Name"
                    autoComplete="given-name"
                  />
                </div>
                {errors.firstName && <div style={styles.errorText}>{errors.firstName}</div>}
              </div>
              
              {/* Last Name Field */}
              <div style={styles.formGroup}>
                <div style={{
                  ...styles.inputWrapper,
                  ...(errors.lastName ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.icon}>👤</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'lastName' ? styles.inputFocus : {})
                    }}
                    onFocus={() => setFocusedElement('lastName')}
                    onBlur={() => setFocusedElement(null)}
                    disabled={isLoading}
                    aria-label="Last Name"
                    autoComplete="family-name"
                  />
                </div>
                {errors.lastName && <div style={styles.errorText}>{errors.lastName}</div>}
              </div>
              
              {/* Password Field */}
              <div style={styles.formGroup}>
                <div style={{
                  ...styles.inputWrapper,
                  ...(errors.password ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.icon}>🔒</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'password' ? styles.inputFocus : {})
                    }}
                    onFocus={() => setFocusedElement('password')}
                    onBlur={() => setFocusedElement(null)}
                    disabled={isLoading}
                    aria-label="Password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && <div style={styles.errorText}>{errors.password}</div>}
              </div>
              
              {/* Confirm Password Field */}
              <div style={styles.formGroup}>
                <div style={{
                  ...styles.inputWrapper,
                  ...(errors.confirmPassword ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.icon}>🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'confirmPassword' ? styles.inputFocus : {})
                    }}
                    onFocus={() => setFocusedElement('confirmPassword')}
                    onBlur={() => setFocusedElement(null)}
                    disabled={isLoading}
                    aria-label="Confirm Password"
                    autoComplete="new-password"
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <span style={styles.checkmark}>✓</span>
                  )}
                </div>
                {errors.confirmPassword && <div style={styles.errorText}>{errors.confirmPassword}</div>}
              </div>
              
              {/* Sign Up Button */}
              <div style={{width: '100%', textAlign: 'center' as const, marginTop: '20px'}}>
                <button
                  type="submit" 
                  style={{
                    ...styles.submitButton,
                    ...(focusedElement === 'submitBtn' ? styles.submitButtonFocus : {})
                  }}
                  disabled={isLoading}
                  onFocus={() => setFocusedElement('submitBtn')}
                  onBlur={() => setFocusedElement(null)}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.backgroundColor = 
                        (styles.submitButtonHover as any).backgroundColor;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        (styles.submitButton as any).backgroundColor;
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.transform =
                        (styles.submitButtonActive as any).transform;
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.transform = 'none';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={styles.loadingSpinner}></span>
                      Signing up...
                    </>
                  ) : 'Sign up'}
                </button>
              </div>
            </form>
            
            {/* Alternative signup */}
            <p style={styles.altLoginText}>Or sign up with</p>
            <button 
              style={{
                ...styles.ksuButton,
                ...(focusedElement === 'ksuBtn' ? styles.ksuButtonFocus : {})
              }}
              disabled={isLoading}
              onFocus={() => setFocusedElement('ksuBtn')}
              onBlur={() => setFocusedElement(null)}
              onMouseOver={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 
                    (styles.ksuButtonHover as any).backgroundColor;
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    (styles.ksuButton as any).backgroundColor;
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.transform =
                    (styles.ksuButtonActive as any).transform;
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.transform = 'none';
                }
              }}
            >
              KSU NetID
            </button>
            
            {/* Sign in link */}
            <div style={styles.signInContainer}>
              <p style={styles.signInText}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{
                    ...styles.link,
                    ...(focusedElement === 'signInLink' ? styles.linkFocus : {})
                  }}
                  onFocus={() => setFocusedElement('signInLink')}
                  onBlur={() => setFocusedElement(null)}
                  onMouseOver={(e) => {
                    (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLAnchorElement).style.textDecoration = 'none';
                  }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SignUpForm;
