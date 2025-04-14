import React, { useState, CSSProperties, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  const navigate = useNavigate();

  // Update window dimensions when resized or orientation changes
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

  // Determine if we're on mobile
  const isMobile = windowWidth < 768;
  // Check if device is in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Call the backend API
      const response = await axios.post('/api/login', {
        email,
        password
      });
      
      // Check if login was successful
      if (response.data.success) {
        // Store user data in localStorage or sessionStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to profile page
        navigate('/profile');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles: Record<string, CSSProperties> = {
    outerContainer: {
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      padding: isMobile ? (isLandscape ? '15px' : '20px') : '40px',
      boxSizing: 'border-box',
      // Safe area insets for modern iOS devices (use with @supports)
      paddingTop: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-top, 0px))`,
      paddingBottom: `max(20px, env(safe-area-inset-bottom, 0px))`,
      paddingLeft: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-left, 0px))`,
      paddingRight: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-right, 0px))`,
    },
    backButton: {
      position: isMobile ? 'relative' : 'absolute',
      top: isMobile ? 'auto' : '40px',
      left: isMobile ? 'auto' : '40px',
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
      width: isMobile ? 'fit-content' : 'auto',
      // Add focus styles for accessibility
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
      marginBottom: '20px',
      width: '100%'
    },
    inputWrapper: {
      position: 'relative',
      width: '100%'
    },
    icon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280',
      fontSize: '18px',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      paddingLeft: '45px', // Space for the icon
      fontSize: isMobile ? '14px' : '16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#f9fafb',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
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
      opacity: loading ? 0.7 : 1,
      pointerEvents: loading ? 'none' : 'auto',
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
    signupContainer: {
      textAlign: 'center' as const,
      width: '100%'
    },
    signupText: {
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
    errorMessage: {
      color: '#ef4444',
      marginBottom: '15px',
      fontSize: isMobile ? '13px' : '14px',
      textAlign: 'center' as const,
      maxWidth: '100%',
      wordBreak: 'break-word',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '4px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    errorIcon: {
      marginRight: '6px',
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

  // State for focused elements
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  return (
    <div style={styles.outerContainer}>
      {isMobile ? (
        <div style={styles.contentContainer}>
          {/* Back button - placed at the top for mobile */}
          <Link 
            to="/map" 
            style={{
              ...styles.backButton,
              ...(focusedElement === 'backBtn' ? styles.backButtonFocus : {})
            }}
            onFocus={() => setFocusedElement('backBtn')}
            onBlur={() => setFocusedElement(null)}
          >
            <span style={styles.backArrow}>◀</span>
            Back to Map
          </Link>
          
          {/* Login header */}
          <h1 style={styles.header}>Log In</h1>
          
          {/* Error message display */}
          {error && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}
          
          {/* Login form */}
          <form style={{width: '100%'}} onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>✉</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'email' ? styles.inputFocus : {})
                  }}
                  required
                  disabled={loading}
                  onFocus={() => setFocusedElement('email')}
                  onBlur={() => setFocusedElement(null)}
                  aria-label="Email"
                  autoComplete="email"
                />
              </div>
            </div>
            
            {/* Password field */}
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>🔒</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{
                    ...styles.input,
                    ...(focusedElement === 'password' ? styles.inputFocus : {})
                  }}
                  required
                  disabled={loading}
                  onFocus={() => setFocusedElement('password')}
                  onBlur={() => setFocusedElement(null)}
                  aria-label="Password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            {/* Sign in button */}
            <div style={{width: '100%', textAlign: 'center' as const}}>
              <button 
                type="submit" 
                style={{
                  ...styles.submitButton,
                  ...(focusedElement === 'submitBtn' ? styles.submitButtonFocus : {})
                }}
                disabled={loading}
                onFocus={() => setFocusedElement('submitBtn')}
                onBlur={() => setFocusedElement(null)}
                onMouseOver={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 
                      (styles.submitButtonHover as any).backgroundColor;
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      (styles.submitButton as any).backgroundColor;
                  }
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform =
                      (styles.submitButtonActive as any).transform;
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.loadingSpinner}></span>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
          
          {/* Alternative login */}
          <p style={styles.altLoginText}>Or sign in with</p>
          <button 
            style={{
              ...styles.ksuButton,
              ...(focusedElement === 'ksuBtn' ? styles.ksuButtonFocus : {})
            }}
            disabled={loading}
            onFocus={() => setFocusedElement('ksuBtn')}
            onBlur={() => setFocusedElement(null)}
            onMouseOver={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = 
                  (styles.ksuButtonHover as any).backgroundColor;
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  (styles.ksuButton as any).backgroundColor;
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform =
                  (styles.ksuButtonActive as any).transform;
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'none';
              }
            }}
          >
            KSU NetID
          </button>
          
          {/* Sign up link */}
          <div style={styles.signupContainer}>
            <p style={styles.signupText}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                style={{
                  ...styles.link,
                  ...(focusedElement === 'signupLink' ? styles.linkFocus : {})
                }}
                onFocus={() => setFocusedElement('signupLink')}
                onBlur={() => setFocusedElement(null)}
                onMouseOver={(e) => {
                  (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLAnchorElement).style.textDecoration = 'none';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Back to Map button - absolutely positioned for desktop */}
          <Link 
            to="/map" 
            style={{
              ...styles.backButton,
              ...(focusedElement === 'backBtn' ? styles.backButtonFocus : {})
            }}
            onFocus={() => setFocusedElement('backBtn')}
            onBlur={() => setFocusedElement(null)}
            onMouseOver={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#f9fafb';
            }}
          >
            <span style={styles.backArrow}>◀</span>
            Back to Map
          </Link>
          
          {/* Centered content */}
          <div style={styles.contentContainer}>
            {/* Login header */}
            <h1 style={styles.header}>Log In</h1>
            
            {/* Error message display */}
            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}
            
            {/* Login form */}
            <form style={{width: '100%'}} onSubmit={handleSubmit} noValidate>
              {/* Email field */}
              <div style={styles.formGroup}>
                <div style={styles.inputWrapper}>
                  <span style={styles.icon}>✉</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'email' ? styles.inputFocus : {})
                    }}
                    required
                    disabled={loading}
                    onFocus={() => setFocusedElement('email')}
                    onBlur={() => setFocusedElement(null)}
                    aria-label="Email"
                    autoComplete="email"
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div style={styles.formGroup}>
                <div style={styles.inputWrapper}>
                  <span style={styles.icon}>🔒</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{
                      ...styles.input,
                      ...(focusedElement === 'password' ? styles.inputFocus : {})
                    }}
                    required
                    disabled={loading}
                    onFocus={() => setFocusedElement('password')}
                    onBlur={() => setFocusedElement(null)}
                    aria-label="Password"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              
              {/* Sign in button */}
              <div style={{width: '100%', textAlign: 'center' as const}}>
                <button 
                  type="submit" 
                  style={{
                    ...styles.submitButton,
                    ...(focusedElement === 'submitBtn' ? styles.submitButtonFocus : {})
                  }}
                  disabled={loading}
                  onFocus={() => setFocusedElement('submitBtn')}
                  onBlur={() => setFocusedElement(null)}
                  onMouseOver={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.backgroundColor = 
                        (styles.submitButtonHover as any).backgroundColor;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        (styles.submitButton as any).backgroundColor;
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.transform =
                        (styles.submitButtonActive as any).transform;
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.transform = 'none';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span style={styles.loadingSpinner}></span>
                      Signing in...
                    </>
                  ) : 'Sign in'}
                </button>
              </div>
            </form>
            
            {/* Alternative login */}
            <p style={styles.altLoginText}>Or sign in with</p>
            <button 
              style={{
                ...styles.ksuButton,
                ...(focusedElement === 'ksuBtn' ? styles.ksuButtonFocus : {})
              }}
              disabled={loading}
              onFocus={() => setFocusedElement('ksuBtn')}
              onBlur={() => setFocusedElement(null)}
              onMouseOver={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 
                    (styles.ksuButtonHover as any).backgroundColor;
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    (styles.ksuButton as any).backgroundColor;
                }
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.transform =
                    (styles.ksuButtonActive as any).transform;
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.transform = 'none';
                }
              }}
            >
              KSU NetID
            </button>
            
            {/* Sign up link */}
            <div style={styles.signupContainer}>
              <p style={styles.signupText}>
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  style={{
                    ...styles.link,
                    ...(focusedElement === 'signupLink' ? styles.linkFocus : {})
                  }}
                  onFocus={() => setFocusedElement('signupLink')}
                  onBlur={() => setFocusedElement(null)}
                  onMouseOver={(e) => {
                    (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLAnchorElement).style.textDecoration = 'none';
                  }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginForm;
