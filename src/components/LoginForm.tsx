import React, { useState, CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

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
        
        // Redirect to map page
        navigate('/map');
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
      padding: '40px'
    },
    backButton: {
      position: 'absolute',
      top: '40px',
      left: '40px',
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#f9fafb',
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: '16px'
    },
    backArrow: {
      marginRight: '8px'
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '460px',
      margin: '0 auto',
      marginTop: '120px'
    },
    header: {
      fontSize: '38px',
      fontWeight: 'normal',
      color: '#374151',
      marginBottom: '50px',
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
      fontSize: '18px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      paddingLeft: '45px', // Space for the icon
      fontSize: '16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#f9fafb'
    },
    submitButton: {
      width: '200px',
      padding: '12px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      marginBottom: '50px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
      opacity: loading ? 0.7 : 1,
      pointerEvents: loading ? 'none' : 'auto',
    },
    altLoginText: {
      color: '#6b7280',
      marginBottom: '10px',
      fontSize: '16px',
      textAlign: 'center' as const
    },
    ksuButton: {
      width: '200px',
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      color: '#4b5563',
      fontSize: '16px',
      cursor: 'pointer',
      marginBottom: '50px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block'
    },
    signupContainer: {
      textAlign: 'center' as const
    },
    signupText: {
      color: '#6b7280',
      fontSize: '16px'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: 'bold'
    },
    errorMessage: {
      color: '#ef4444',
      marginBottom: '15px',
      fontSize: '14px',
      textAlign: 'center' as const
    }
  };

  return (
    <div style={styles.outerContainer}>
      {/* Back to Map button - absolutely positioned */}
      <Link to="/map" style={styles.backButton}>
        <span style={styles.backArrow}>◀</span>
        Back to Map
      </Link>
      
      {/* Centered content */}
      <div style={styles.contentContainer}>
        {/* Login header */}
        <h1 style={styles.header}>Log In</h1>
        
        {/* Error message display */}
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        {/* Login form */}
        <form style={{width: '100%'}} onSubmit={handleSubmit}>
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
                style={styles.input}
                required
                disabled={loading}
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
                style={styles.input}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Sign in button */}
          <div style={{width: '100%', textAlign: 'center' as const}}>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        {/* Alternative login */}
        <p style={styles.altLoginText}>Or sign in with</p>
        <button style={styles.ksuButton} disabled={loading}>KSU NetID</button>
        
        {/* Sign up link */}
        <div style={styles.signupContainer}>
          <p style={styles.signupText}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
