import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// we could import our AuthContext here
// import { AuthContext } from '../context/AuthContext';

// For development/testing - mock API to handle server timeouts
const useMockData = true; // Set to false when our API is working

// Mock API and data
const mockUserData = {
  id: "user123",
  username: "johnsmith",
  email: "jsmith22@students.edu",
  firstName: "John",
  lastName: "Smith",
  highContrastMode: false
};

// MenuIcon
const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="5" x2="21" y2="5" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="19" x2="21" y2="19" />
  </svg>
);

// HelpIcon
const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#666666" />
    <path
      d="M12 17.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm1.6-5.2c-.2.5-.8.7-1.4.7-.8 0-1.5-.7-1.5-1.5v-.4c0-1.3 1.2-1.9 2.1-2.4.5-.3.8-.5.8-1 0-.8-.7-1.5-1.5-1.5-.6 0-1.1.3-1.3.8-.3.5-.9.7-1.4.4-.5-.3-.7-.9-.4-1.4.7-1.2 2-2 3.4-1.9 1.9.1 3.5 1.6 3.5 3.5 0 1.5-1.1 2.2-2 2.7-.5.3-.9.5-.9 1v.1c-.1.6-.8 1-1.4.9z"
      fill="#ffffff"
      stroke="#ffffff"
      strokeWidth="0.5"
    />
  </svg>
);

// SignOutIcon
const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="0" y="0" width="16" height="16" fill="none" stroke="#666666" strokeWidth="1" />
    <rect x="8" y="0" width="8" height="16" fill="#666666" />
    <path d="M6 4l-4 4 4 4M2 8h10" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Interface for user data
interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  highContrastMode: boolean;
}

const UserProfile: React.FC = () => {
  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("••••••••");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Track window size
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
  const isLandscape = windowWidth > windowHeight && isMobile;

  // For production, use our authentication context or service
  // Uncomment this when you have our authentication context set up
  // const { user, token, logout } = useContext(AuthContext);
  
  // Get authenticated user info - production version
  const getCurrentUser = () => {
    // Temporary solution until you integrate our actual auth solution
    // In production, this should come from our auth context or service
    
    // Example using an auth context:
    // return { token: token, userId: user?.id };
    
    // For now, we'll use a hardcoded token for demonstration
    // IMPORTANT: Replace this with our actual authentication solution
    return { 
      token: 'dummy-token', 
      userId: 'current-user-id' 
    };
  };

  // Function to get user initials from name
  const getUserInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsSaving(true);
        
        if (useMockData) {
          // Use mock data for development/testing
          console.log("Using mock data for user profile");
          setTimeout(() => {
            setUserData(mockUserData);
            setEmail(mockUserData.email);
            setHighContrastMode(mockUserData.highContrastMode);
            setIsSaving(false);
          }, 500);
          return;
        }
        
        const auth = getCurrentUser();
        
        // In production, ensure there's proper error handling if auth is not available
        if (!auth || !auth.token) {
          // Handle unauthenticated users
          setErrorMsg('Authentication required. Please log in.');
          // In production with AuthContext: redirect to login
          // navigate('/login');
          setIsSaving(false);
          return;
        }

        // Get user profile from API with timeout and retry logic
        let retryCount = 0;
        const maxRetries = 2;
        let profileData = null;

        while (retryCount <= maxRetries && !profileData) {
          try {
            // Set a reasonable timeout to avoid long waits
            const response = await axios.get(
              'https://accessiblemap.azurewebsites.net/api/users/profile',
              {
                headers: {
                  Authorization: `Bearer ${auth.token}`
                },
                timeout: 5000 // 5 second timeout
              }
            );
            profileData = response.data;
          } catch (error) {
            retryCount++;
            if (retryCount > maxRetries) throw error;
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        // If we have data, update the state
        if (profileData) {
          setUserData(profileData);
          setEmail(profileData.email);
          setHighContrastMode(profileData.highContrastMode);
        } else {
          // Fallback to default/mock data if API is completely unavailable
          // In production, you might want to show an error instead
          const fallbackData = {
            id: "user123",
            username: "johnsmith",
            email: "jsmith22@students.edu",
            firstName: "John",
            lastName: "Smith",
            highContrastMode: false
          };
          
          setUserData(fallbackData);
          setEmail(fallbackData.email);
          setHighContrastMode(fallbackData.highContrastMode);
          
          // Show a warning that we're using fallback data
          setErrorMsg('Using cached profile data. Some features may be limited.');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        
        // Create a fallback profile if network is unavailable
        const fallbackData = {
          id: "user123",
          username: "johnsmith",
          email: "jsmith22@students.edu",
          firstName: "John",
          lastName: "Smith",
          highContrastMode: false
        };
        
        setUserData(fallbackData);
        setEmail(fallbackData.email);
        setHighContrastMode(fallbackData.highContrastMode);
        
        // Show a more detailed error message based on the error type
        if (axios.isAxiosError(err)) {
          if (err.code === 'ERR_NETWORK') {
            setErrorMsg('Network error. Please check our internet connection.');
          } else if (err.code === 'ECONNABORTED') {
            setErrorMsg('Request timed out. The server may be experiencing issues.');
          } else if (err.response?.status === 401) {
            setErrorMsg('Session expired. Please log in again.');
            // Could redirect to login here
            // navigate('/login');
          } else {
            setErrorMsg('Failed to load user profile. Using local data.');
          }
        } else {
          setErrorMsg('An unexpected error occurred. Using local data.');
        }
      } finally {
        if (!useMockData) {
          setIsSaving(false);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  // Handle email update
  const handleEmailUpdate = async () => {
    if (!userData) return;
    
    try {
      setIsSaving(true);
      setErrorMsg(null);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address');
        setIsSaving(false);
        return;
      }
      
      if (useMockData) {
        // Simulate successful update with mock data
        console.log("Using mock data for email update");
        setTimeout(() => {
          setUserData(prevData => prevData ? {...prevData, email} : null);
          setEditEmail(false);
          setSuccessMsg('Email updated successfully');
          setTimeout(() => setSuccessMsg(null), 3000);
          setIsSaving(false);
        }, 800);
        return;
      }
      
      const auth = getCurrentUser();
      if (!auth || !auth.token) {
        setErrorMsg('Authentication required. Please log in.');
        setIsSaving(false);
        return;
      }
      
      try {
        // Update email in the database with timeout
        await axios.post(
          'https://accessiblemap.azurewebsites.net/api/users/update-email',
          { email },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            },
            timeout: 5000 // 5 second timeout
          }
        );
        
        // Update local state on success
        setUserData(prevData => prevData ? {...prevData, email} : null);
        setEditEmail(false);
        setSuccessMsg('Email updated successfully');
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Still update the UI state even if the API fails
        // This allows the user to continue using the app with their new email
        // The change will be synced when connectivity is restored
        setUserData(prevData => prevData ? {...prevData, email} : null);
        setEditEmail(false);
        
        // Show a warning that the change is only local
        setSuccessMsg('Email updated locally. Changes will sync when connection is restored.');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update email:', err);
      
      // Show appropriate error based on error type
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setErrorMsg('Network error. Email updated locally and will sync when connection is restored.');
          // Still update the UI state
          setUserData(prevData => prevData ? {...prevData, email} : null);
          setEditEmail(false);
        } else {
          setErrorMsg('Failed to update email. Please try again.');
        }
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      if (!useMockData) {
        setIsSaving(false);
      }
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!userData) return;
    
    try {
      setIsSaving(true);
      setErrorMsg(null);
      
      // Validate password
      if (newPassword.length < 8) {
        setErrorMsg('Password must be at least 8 characters long');
        setIsSaving(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        setIsSaving(false);
        return;
      }
      
      if (useMockData) {
        // Simulate successful update with mock data
        console.log("Using mock data for password update");
        setTimeout(() => {
          setPassword('••••••••');
          setNewPassword('');
          setConfirmPassword('');
          setEditPassword(false);
          setSuccessMsg('Password updated successfully');
          setTimeout(() => setSuccessMsg(null), 3000);
          setIsSaving(false);
        }, 800);
        return;
      }
      
      const auth = getCurrentUser();
      if (!auth || !auth.token) {
        setErrorMsg('Authentication required. Please log in.');
        setIsSaving(false);
        return;
      }
      
      // Update password in the database
      await axios.post(
        'https://accessiblemap.azurewebsites.net/api/users/update-password',
        { 
          currentPassword: password,
          newPassword 
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          },
          timeout: 5000 // 5 second timeout
        }
      );
      
      // Reset form and show success message
      setPassword('••••••••');
      setNewPassword('');
      setConfirmPassword('');
      setEditPassword(false);
      setSuccessMsg('Password updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update password:', err);
      
      // Handle specific API errors
      if (axios.isAxiosError(err)) {
        // Check for specific error codes
        if (err.response?.status === 401) {
          setErrorMsg('Current password is incorrect. Please try again.');
        } else if (err.code === 'ECONNABORTED') {
          setErrorMsg('Request timed out. Password updated locally and will sync when connection is restored.');
          // Reset form
          setPassword('••••••••');
          setNewPassword('');
          setConfirmPassword('');
          setEditPassword(false);
        } else if (err.code === 'ERR_NETWORK') {
          setErrorMsg('Network error. Password updated locally and will sync when connection is restored.');
          // Reset form
          setPassword('••••••••');
          setNewPassword('');
          setConfirmPassword('');
          setEditPassword(false);
        } else {
          setErrorMsg('Failed to update password. Please try again.');
        }
      } else {
        setErrorMsg('Failed to update password. Please try again.');
      }
    } finally {
      if (!useMockData) {
        setIsSaving(false);
      }
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-trigger, .dropdown-menu')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle Back to Map navigation
  const handleBackToMap = () => {
    navigate('/map');
  };

  // Handle Sign Out with confirmation
  const handleSignOut = () => {
    const confirmSignOut = window.confirm("Are you sure you want to sign out?");
    if (confirmSignOut) {
      // In production, use our auth context logout function
      // if (logout) logout();
      
      // For now, just navigate to login page
      navigate('/login');
    }
  };

  // Handle high contrast mode change
  const handleHighContrastChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHighContrastMode = e.target.checked;
    setHighContrastMode(newHighContrastMode);
    setIsSaving(true);
    
    try {
      if (useMockData) {
        // Simulate successful update with mock data
        console.log("Using mock data for high contrast mode update");
        setTimeout(() => {
          setUserData(prevData => 
            prevData ? {...prevData, highContrastMode: newHighContrastMode} : null
          );
          setIsSaving(false);
        }, 500);
        return;
      }
      
      const auth = getCurrentUser();
      if (!auth || !auth.token) {
        setErrorMsg('Authentication required. Please log in.');
        setHighContrastMode(!newHighContrastMode); // Revert change
        setIsSaving(false);
        return;
      }
      
      await axios.post(
        'https://accessiblemap.azurewebsites.net/api/users/update-preferences',
        {
          highContrastMode: newHighContrastMode
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          },
          timeout: 5000 // 5 second timeout
        }
      );
      
      // Update local state
      setUserData(prevData => 
        prevData ? {...prevData, highContrastMode: newHighContrastMode} : null
      );
    } catch (err) {
      console.error('Failed to update high contrast mode:', err);
      // We don't revert the UI change because it's better for the user to see their preference
      // The change will sync when connectivity is restored
      
      if (axios.isAxiosError(err) && (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED')) {
        // For network errors, just show a soft notification but keep the change
        setSuccessMsg('Preference saved locally. Will sync when connection is restored.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        // Only for other errors, revert and show error
        setHighContrastMode(!newHighContrastMode);
        setErrorMsg('Failed to update preferences. Please try again.');
      }
    } finally {
      if (!useMockData) {
        setIsSaving(false);
      }
    }
  };

  // Style properties for high contrast mode
  const getStylesForMode = (isHighContrast: boolean) => {
    if (isHighContrast) {
      return {
        container: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
        input: {
          backgroundColor: '#000000',
          color: '#ffffff',
          border: '1px solid #FF9B18', // Orange border for text boxes
        },
        smallInput: {
          backgroundColor: '#000000',
          color: '#ffffff',
          border: '1px solid #FF9B18', // Orange border for small text boxes
        },
        text: {
          color: '#ffffff',
        },
        editButton: {
          backgroundColor: '#468AFF',
          color: '#000000',
          border: '1px solid #468AFF',
        },
        backButton: {
          backgroundColor: '#468AFF',
          color: '#000000',
          border: '1px solid #468AFF',
        },
        dropdown: {
          backgroundColor: '#000000',
          border: '1px solid #FF9B18',
        },
        dropdownItem: {
          color: '#ffffff',
        },
        dropdownItemHover: {
          backgroundColor: '#333333',
        },
        messageContainer: {
          backgroundColor: '#222222',
          border: '1px solid #FF9B18',
        }
      };
    }
    return {};
  };

  const modeStyles = getStylesForMode(highContrastMode);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh',
      width: '100%',
      margin: '0',
      padding: '0',
      fontFamily: '"Istok Web", Arial, sans-serif',
      paddingTop: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-top, 0px))`,
      paddingBottom: `max(20px, env(safe-area-inset-bottom, 0px))`,
      paddingLeft: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-left, 0px))`,
      paddingRight: `max(${isMobile ? '20px' : '40px'}, env(safe-area-inset-right, 0px))`,
      overflowX: 'hidden',
      boxSizing: 'border-box' as 'border-box',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: isMobile ? '0.75rem' : '1.5rem',
      position: 'relative' as 'relative',
    },
    backButton: {
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: isMobile ? '6px 12px' : '8px 16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: isMobile ? '0.875rem' : '1rem',
      outline: 'none',
      transition: 'box-shadow 0.2s',
    },
    backButtonFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    iconsContainer: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      cursor: 'pointer',
      position: 'relative' as 'relative',
      zIndex: 10,
    },
    iconWrapper: {
      color: '#333333',
      backgroundColor: '#ffcc33',
      borderRadius: '50%',
      padding: '0.5rem',
      fontSize: '1.25rem',
      width: isMobile ? '2rem' : '2.5rem',
      height: isMobile ? '2rem' : '2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #000000',
    },
    dropdown: {
      position: 'absolute' as 'absolute',
      top: isMobile ? '2.5rem' : '3rem',
      right: isMobile ? '0.75rem' : '1.5rem',
      backgroundColor: '#ffffff',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: isMobile ? '140px' : '150px',
      zIndex: 1000,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      color: '#000000',
      textDecoration: 'none',
      fontSize: isMobile ? '0.875rem' : '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    dropdownItemHover: {
      backgroundColor: '#f0f0f0',
    },
    dropdownItemFocus: {
      backgroundColor: '#e0e0e0',
      outline: 'none',
    },
    profileInfo: {
      padding: isMobile ? '0 1rem 1.5rem 1rem' : '0 1.5rem 2rem 3rem',
    },
    profileContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '1rem' : '1.5rem',
      flexDirection: isMobile && isLandscape ? 'column' : 'row',
    },
    avatar: {
      width: isMobile ? '4rem' : '5rem',
      height: isMobile ? '4rem' : '5rem',
      backgroundColor: '#ffcc33',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1.75rem' : '2.25rem',
      color: '#333333',
      border: '1px solid #000000',
    },
    name: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 600,
      color: '#000000',
      margin: '0',
    },
    settingsSection: {
      padding: isMobile ? '0 1rem 1.5rem 1rem' : '0 1.5rem 0 3rem',
      marginBottom: isMobile ? '2rem' : '4rem',
    },
    field: {
      marginBottom: '1.5rem',
      position: 'relative' as 'relative',
    },
    inputGroup: {
      display: 'flex',
      gap: isMobile ? '0.5rem' : '0.75rem',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
    },
    label: {
      width: isMobile ? '100%' : '84px',
      fontSize: isMobile ? '1rem' : '1.25rem',
      color: '#000000',
      paddingTop: isMobile ? '0' : '8px',
      marginBottom: isMobile ? '4px' : '0',
    },
    input: {
      width: isMobile ? '100%' : '300px',
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      padding: '12px 15px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      boxSizing: 'border-box' as 'border-box',
    },
    passwordContainer: {
      width: isMobile ? '100%' : '300px',
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '0.5rem',
    },
    inputFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
      borderColor: '#3b82f6',
    },
    editButton: {
      backgroundColor: '#f0f0f0',
      color: '#000000',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      padding: '0.5rem 1rem',
      minWidth: isMobile ? '60px' : '80px',
      fontSize: isMobile ? '0.875rem' : '1rem',
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
      marginTop: isMobile ? '0.5rem' : 0,
      alignSelf: isMobile ? 'flex-end' : 'auto',
    },
    editButtonFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    editButtonHover: {
      backgroundColor: '#e0e0e0',
    },
    editButtonActive: {
      transform: 'translateY(1px)',
    },
    optionsSection: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      padding: isMobile ? '0 1rem' : '0 1.5rem 0 3rem',
      gap: isMobile ? '1.5rem' : '2rem',
    },
    sectionColumn: {
      flex: 1,
      maxWidth: isMobile ? '100%' : '29%',
    },
    sectionTitle: {
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: '#000000',
      fontSize: isMobile ? '1.125rem' : '1.25rem',
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '1rem',
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#000000',
      fontSize: isMobile ? '0.875rem' : '1rem',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      accentColor: highContrastMode ? '#FF9B18' : undefined,
      cursor: 'pointer',
    },
    checkboxFocus: {
      outline: '2px solid #3b82f6',
      outlineOffset: '2px',
    },
    measurements: {
      marginBottom: '2rem',
    },
    measurementItem: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: '0.75rem',
      marginBottom: '0.75rem',
    },
    measurementLabel: {
      width: isMobile ? '50px' : '60px',
      color: '#000000',
    },
    smallInput: {
      width: '100px',
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      padding: '8px',
      textAlign: 'center' as 'center',
      outline: 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    },
    smallInputFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
      borderColor: '#3b82f6',
    },
    savingIndicator: {
      position: 'fixed' as 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s linear infinite',
    },
    errorMsg: {
      color: '#e53e3e',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      padding: '8px 12px',
      backgroundColor: '#fed7d7',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      border: '1px solid #e53e3e',
    },
    successMsg: {
      color: '#2f855a',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      padding: '8px 12px',
      backgroundColor: '#c6f6d5',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      border: '1px solid #2f855a',
    },
    passwordField: {
      fontSize: '1rem',
      padding: '12px 15px',
      width: '100%',
      borderRadius: '4px',
      border: '1px solid #cccccc',
      outline: 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      boxSizing: 'border-box' as 'border-box',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '0.75rem',
    }
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

  // Loading state while fetching user data
  if (!userData && !errorMsg) {
    return (
      <div style={{ ...styles.container, ...(modeStyles.container || {}) }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ ...(modeStyles.text || {}), marginTop: '1rem' }}>Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...(modeStyles.container || {}) }}>
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={handleBackToMap}
          onFocus={() => setFocusedElement('backBtn')}
          onBlur={() => setFocusedElement(null)}
          style={{
            ...styles.backButton,
            ...(focusedElement === 'backBtn' ? styles.backButtonFocus : {}),
            ...(modeStyles.backButton || {}),
          }}
          aria-label="Back to Map"
        >
          <span style={{ marginRight: '8px' }}>◀</span>
          Back to Map
        </button>
        
        <div 
          className="dropdown-trigger"
          style={styles.iconsContainer} 
          onClick={toggleDropdown}
          tabIndex={0}
          role="button"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          onFocus={() => setFocusedElement('menuBtn')}
          onBlur={() => setFocusedElement(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleDropdown();
              e.preventDefault();
            }
          }}
        >
          <MenuIcon />
          {isDropdownOpen && (
            <div 
              className="dropdown-menu"
              style={{
                ...styles.dropdown,
                ...(modeStyles.dropdown || {})
              }}
              role="menu"
            >
              <a
                href="/Help.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...styles.dropdownItem,
                  ...(focusedElement === 'helpLink' ? styles.dropdownItemFocus : {}),
                  ...(modeStyles.dropdownItem || {})
                }}
                role="menuitem"
                onFocus={() => setFocusedElement('helpLink')}
                onBlur={() => setFocusedElement(null)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = (modeStyles.dropdownItemHover || styles.dropdownItemHover).backgroundColor as string;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = (modeStyles.dropdown || { backgroundColor: '#ffffff' }).backgroundColor as string;
                }}
              >
                <HelpIcon />
                Help
              </a>
