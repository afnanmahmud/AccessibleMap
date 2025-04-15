import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const UserProfile: React.FC = () => {
  const [email, setEmail] = useState("jsmith22@students.edu");
  const [password, setPassword] = useState("••••••••");
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const username = "johnsmith"; // Replace with actual user authentication in production
        const response = await axios.get(`https://accessiblemap.azurewebsites.net/api/users/${username}`);
        setHighContrastMode(response.data.highContrastMode);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUserProfile();
  }, []);

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
      navigate('/map');
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
      };
    }
    return {};
  };

  const modeStyles = getStylesForMode(highContrastMode);

  const handleHighContrastChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHighContrastMode = e.target.checked;
    setHighContrastMode(newHighContrastMode);
    setIsSaving(true);
    
    try {
      const username = "johnsmith"; // Replace with actual user authentication in production
      await axios.post('https://accessiblemap-gnddadh9ghbgc9e8.eastus-01.azurewebsites.net/api/users', {
        username,
        email: email || "jsmith22@students.edu", // Use current email or fallback
        highContrastMode: newHighContrastMode
      });
    } catch (err) {
      console.error('Failed to update high contrast mode:', err);
      // Optionally revert the state if the API call fails
      setHighContrastMode(!newHighContrastMode);
    } finally {
      setIsSaving(false);
    }
  };

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
              
              <div
                style={{
                  ...styles.dropdownItem,
                  ...(focusedElement === 'signOutBtn' ? styles.dropdownItemFocus : {}),
                  ...(modeStyles.dropdownItem || {})
                }}
                onClick={handleSignOut}
                role="menuitem"
                tabIndex={0}
                onFocus={() => setFocusedElement('signOutBtn')}
                onBlur={() => setFocusedElement(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSignOut();
                    e.preventDefault();
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = (modeStyles.dropdownItemHover || styles.dropdownItemHover).backgroundColor as string;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = (modeStyles.dropdown || { backgroundColor: '#ffffff' }).backgroundColor as string;
                }}
              >
                <SignOutIcon />
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div style={styles.profileInfo}>
        <div style={styles.profileContainer}>
          <div style={styles.avatar}>
            <span>JS</span>
          </div>
          <h2 style={{ ...styles.name, ...(modeStyles.text || {}) }}>
            John Smith
          </h2>
        </div>
      </div>

      {/* Account Settings */}
      <div style={styles.settingsSection}>
        <div style={styles.field}>
          <div style={styles.inputGroup}>
            <label 
              style={{ ...styles.label, ...(modeStyles.text || {}) }}
              htmlFor="email"
            >
              Email ID
            </label>
            <input
              id="email"
              style={{
                ...styles.input,
                ...(focusedElement === 'email' ? styles.inputFocus : {}),
                ...(modeStyles.input || {})
              }}
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editEmail}
              onFocus={() => setFocusedElement('email')}
              onBlur={() => setFocusedElement(null)}
              aria-label="Email"
            />
            <button
              style={{
                ...styles.editButton,
                ...(focusedElement === 'editEmailBtn' ? styles.editButtonFocus : {}),
                ...(modeStyles.editButton || {})
              }}
              onClick={() => setEditEmail(!editEmail)}
              onFocus={() => setFocusedElement('editEmailBtn')}
              onBlur={() => setFocusedElement(null)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = (styles.editButtonHover as any).backgroundColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = (modeStyles.editButton || styles.editButton).backgroundColor as string;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = (styles.editButtonActive as any).transform;
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'none';
              }}
              aria-label={editEmail ? "Save Email" : "Edit Email"}
            >
              {editEmail ? "Save" : "Edit"}
            </button>
          </div>
        </div>
        
        <div style={styles.field}>
          <div style={styles.inputGroup}>
            <label 
              style={{ ...styles.label, ...(modeStyles.text || {}) }}
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              style={{
                ...styles.input,
                ...(focusedElement === 'password' ? styles.inputFocus : {}),
                ...(modeStyles.input || {})
              }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!editPassword}
              onFocus={() => setFocusedElement('password')}
              onBlur={() => setFocusedElement(null)}
              aria-label="Password"
            />
            <button
              style={{
                ...styles.editButton,
                ...(focusedElement === 'editPasswordBtn' ? styles.editButtonFocus : {}),
                ...(modeStyles.editButton || {})
              }}
              onClick={() => setEditPassword(!editPassword)}
              onFocus={() => setFocusedElement('editPasswordBtn')}
              onBlur={() => setFocusedElement(null)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = (styles.editButtonHover as any).backgroundColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = (modeStyles.editButton || styles.editButton).backgroundColor as string;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = (styles.editButtonActive as any).transform;
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'none';
              }}
              aria-label={editPassword ? "Save Password" : "Edit Password"}
            >
              {editPassword ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility & Lifestyle */}
      <div style={styles.optionsSection}>
        {/* Map Accessibility */}
        <div style={styles.sectionColumn}>
          <h3 style={{ ...styles.sectionTitle, ...(modeStyles.text || {}) }}>
            Map Accessibility
          </h3>
          <div style={styles.checkboxGroup}>
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={{
                  ...styles.checkbox,
                  ...(focusedElement === 'accessibleRoutes' ? styles.checkboxFocus : {})
                }}
                id="accessible-routes"
                onFocus={() => setFocusedElement('accessibleRoutes')}
                onBlur={() => setFocusedElement(null)}
                aria-label="Use accessible routes"
              />
              <label htmlFor="accessible-routes">Use accessible routes ♿</label>
            </div>
            
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={{
                  ...styles.checkbox,
                  ...(focusedElement === 'screenReader' ? styles.checkboxFocus : {})
                }}
                id="screen-reader"
                onFocus={() => setFocusedElement('screenReader')}
                onBlur={() => setFocusedElement(null)}
                aria-label="Screen reader"
              />
              <label htmlFor="screen-reader">Screen reader 🔊</label>
            </div>
            
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={{
                  ...styles.checkbox,
                  ...(focusedElement === 'highContrast' ? styles.checkboxFocus : {})
                }}
                id="high-contrast"
                checked={highContrastMode}
                onChange={handleHighContrastChange}
                onFocus={() => setFocusedElement('highContrast')}
                onBlur={() => setFocusedElement(null)}
                aria-label="High contrast mode"
                disabled={isSaving}
              />
              <label htmlFor="high-contrast">High contrast mode 🌙</label>
            </div>
            
{/*             <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={{
                  ...styles.checkbox,
                  ...(focusedElement === 'showElevators' ? styles.checkboxFocus : {})
                }}
                id="show-elevators"
                onFocus={() => setFocusedElement('showElevators')}
                onBlur={() => setFocusedElement(null)}
                aria-label="Show elevators"
              />
              <label htmlFor="show-elevators">Show elevators 🚻</label>
            </div> */}
          </div>
        </div>

        {/* Lifestyle */}
        <div style={styles.sectionColumn}>
          <h3 style={{ ...styles.sectionTitle, ...(modeStyles.text || {}) }}>
            Lifestyle
          </h3>
          <div style={styles.measurements}>
            <div style={styles.measurementItem}>
              <label
                htmlFor="weight"
                style={{ ...styles.measurementLabel, ...(modeStyles.text || {}) }}
              >
                Weight
              </label>
              <input
                id="weight"
                type="text"
                style={{
                  ...styles.smallInput,
                  ...(focusedElement === 'weight' ? styles.smallInputFocus : {}),
                  ...(modeStyles.smallInput || {})
                }}
                onFocus={() => setFocusedElement('weight')}
                onBlur={() => setFocusedElement(null)}
                aria-label="Weight in pounds"
                />
                <span style={{ ...(modeStyles.text || {}) }}>lbs</span>
              </div>
              
              <div style={styles.measurementItem}>
                <label
                  htmlFor="height-feet"
                  style={{ ...styles.measurementLabel, ...(modeStyles.text || {}) }}
                >
                  Height
                </label>
                <input
                  id="height-feet"
                  type="text"
                  style={{
                    ...styles.smallInput,
                    ...(focusedElement === 'heightFeet' ? styles.smallInputFocus : {}),
                    ...(modeStyles.smallInput || {})
                  }}
                  onFocus={() => setFocusedElement('heightFeet')}
                  onBlur={() => setFocusedElement(null)}
                  aria-label="Height in feet"
                />
                <span style={{ ...(modeStyles.text || {}) }}>ft</span>
              </div>
              
              <div style={styles.measurementItem}>
                <label
                  htmlFor="height-inches"
                  style={{ ...styles.measurementLabel, visibility: 'hidden' }}
                >
                  Height
                </label>
                <input
                  id="height-inches"
                  type="text"
                  style={{
                    ...styles.smallInput,
                    ...(focusedElement === 'heightInches' ? styles.smallInputFocus : {}),
                    ...(modeStyles.smallInput || {})
                  }}
                  onFocus={() => setFocusedElement('heightInches')}
                  onBlur={() => setFocusedElement(null)}
                  aria-label="Height in inches"
                />
                <span style={{ ...(modeStyles.text || {}) }}>in</span>
              </div>
            </div>
            
            <div style={styles.checkboxGroup}>
              <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
                <input
                  type="checkbox"
                  style={{
                    ...styles.checkbox,
                    ...(focusedElement === 'longerRoutes' ? styles.checkboxFocus : {})
                  }}
                  id="longer-routes"
                  onFocus={() => setFocusedElement('longerRoutes')}
                  onBlur={() => setFocusedElement(null)}
                  aria-label="Prioritize longer routes"
                />
                <label htmlFor="longer-routes">Prioritize longer routes</label>
              </div>
              
              <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
                <input
                  type="checkbox"
                  style={{
                    ...styles.checkbox,
                    ...(focusedElement === 'showStats' ? styles.checkboxFocus : {})
                  }}
                  id="show-stats"
                  onFocus={() => setFocusedElement('showStats')}
                  onBlur={() => setFocusedElement(null)}
                  aria-label="Show steps and calories"
                />
                <label htmlFor="show-stats">Show steps and calories</label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Saving indicator */}
        {isSaving && (
          <div style={styles.savingIndicator}>
            <span style={styles.loadingSpinner}></span>
            Saving changes...
          </div>
        )}
      </div>
    );
  };
  
  export default UserProfile;
