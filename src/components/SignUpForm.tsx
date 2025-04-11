import React, { useState, ChangeEvent, FormEvent } from 'react';
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

  const navigate = useNavigate(); // Used useNavigate hook for navigation

  const handleBackToMap = () => {
    navigate('/map'); // Redirect to the AccessibleMap component
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
    if (formData.password !== formData.confirmPassword) {
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
      console.log('Sending signup request with:', formData); // Debug payload
      const response = await axios.post('/api/signup', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Signup response:', response.data); // Add logging
      
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
      
      // Redirect to login page after short delay using navigate
      setTimeout(() => {
        navigate('/login'); //
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error); // Log full error
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          setErrors({ email: 'User with this email already exists' });
        } else {
          setErrors({ general: error.response.data.error || 'An error occurred during signup' });
        }
      } else {
        setErrors({ general: 'Network error. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '100%', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Back to Map Button */}
      <div style={{ alignSelf: 'flex-start', marginBottom: '40px' }}>
        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8px 16px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer'
        }}
        onClick={handleBackToMap}
        >
          <span style={{ marginRight: '8px' }}>◀</span> Back to Map
        </button>
      </div>

      {/* Form Container */}
      <div style={{ width: '100%', maxWidth: '350px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#333', 
          marginBottom: '30px',
          fontWeight: 'normal' 
        }}>Sign Up</h1>

        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            width: '100%'
          }}>
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            width: '100%'
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', width: '100%' }}>
          {/* Email Field */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            border: errors.email ? '1px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '15px',
            background: '#f5f5f5'
          }}>
            <span style={{ padding: '0 10px', color: '#000' }}>✉️</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '12px 10px',
                border: 'none',
                background: '#f5f5f5',
                borderRadius: '0 4px 4px 0',
                outline: 'none'
              }}
            />
          </div>
          {errors.email && <div style={{ color: '#dc3545', textAlign: 'left', marginBottom: '10px', fontSize: '14px' }}>{errors.email}</div>}

          {/* First Name Field */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            border: errors.firstName ? '1px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '15px',
            background: '#f5f5f5'
          }}>
            <span style={{ padding: '0 10px', color: '#000' }}>👤</span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              style={{
                width: '100%',
                padding: '12px 10px',
                border: 'none',
                background: '#f5f5f5',
                borderRadius: '0 4px 4px 0',
                outline: 'none'
              }}
            />
          </div>
          {errors.firstName && <div style={{ color: '#dc3545', textAlign: 'left', marginBottom: '10px', fontSize: '14px' }}>{errors.firstName}</div>}

          {/* Last Name Field */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            border: errors.lastName ? '1px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '15px',
            background: '#f5f5f5'
          }}>
            <span style={{ padding: '0 10px', color: '#000' }}>👤</span>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              style={{
                width: '100%',
                padding: '12px 10px',
                border: 'none',
                background: '#f5f5f5',
                borderRadius: '0 4px 4px 0',
                outline: 'none'
              }}
            />
          </div>
          {errors.lastName && <div style={{ color: '#dc3545', textAlign: 'left', marginBottom: '10px', fontSize: '14px' }}>{errors.lastName}</div>}

          {/* Password Field */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            border: errors.password ? '1px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '15px',
            background: '#f5f5f5'
          }}>
            <span style={{ padding: '0 10px', color: '#000' }}>🔒</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '12px 10px',
                border: 'none',
                background: '#f5f5f5',
                borderRadius: '0 4px 4px 0',
                outline: 'none'
              }}
            />
          </div>
          {errors.password && <div style={{ color: '#dc3545', textAlign: 'left', marginBottom: '10px', fontSize: '14px' }}>{errors.password}</div>}

          {/* Confirm Password Field */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            border: errors.confirmPassword ? '1px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '20px',
            background: '#f5f5f5',
            position: 'relative'
          }}>
            <span style={{ padding: '0 10px', color: '#000' }}>🔒</span>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              style={{
                width: '100%',
                padding: '12px 10px',
                paddingRight: '30px',
                border: 'none',
                background: '#f5f5f5',
                borderRadius: '0 4px 4px 0',
                outline: 'none'
              }}
            />
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <span style={{ position: 'absolute', right: '10px', color: '#000' }}>✓</span>
            )}
          </div>
          {errors.confirmPassword && <div style={{ color: '#dc3545', textAlign: 'left', marginBottom: '10px', fontSize: '14px' }}>{errors.confirmPassword}</div>}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '50%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#0037ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'normal',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        {/* Or sign up with */}
        <div style={{ marginBottom: '20px', width: '100%' }}>
          <p style={{ marginBottom: '10px', color: '#666' }}>Or sign up with</p>
          <button
            style={{
              width: '50%',
              padding: '12px',
              backgroundColor: '#f1f1f1',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            KSU NetID
          </button>
        </div>

        {/* Already have an account */}
        <p style={{ color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0037ff', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;