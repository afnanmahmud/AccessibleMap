import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Add axios for API calls

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const navigate = useNavigate();

  // Fetch user profile data (highContrastMode) on component mount
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
      };
    }
    return {};
  };

  const modeStyles = getStylesForMode(highContrastMode);

  const handleHighContrastChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHighContrastMode = e.target.checked;
    setHighContrastMode(newHighContrastMode);
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
    }
  };

  useEffect(() => {
  //  console.log("High contrast mode changed to:", highContrastMode);
  }, [highContrastMode]);

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh',
      width: '100%',
      margin: '0',
      padding: '0',
      fontFamily: '"Istok Web", sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '1.5rem',
      position: 'relative' as 'relative', // For positioning the dropdown
    },
    backButton: {
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '8px 16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
    },
    iconsContainer: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      cursor: 'pointer', // To make the icon clickable
    },
    iconWrapper: {
      color: '#333333',
      backgroundColor: '#ffcc33',
      borderRadius: '50%',
      padding: '0.5rem',
      fontSize: '1.25rem',
      width: '2.5rem',
      height: '2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #000000',
    },
    dropdown: {
      position: 'absolute' as 'absolute',
      top: '3rem', // Position below the icon
      right: '1.5rem',
      backgroundColor: '#ffffff',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: '150px',
      zIndex: 1000,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      color: '#000000',
      textDecoration: 'none', // Remove underline from Link
      fontSize: '1rem',
      cursor: 'pointer',
    },
    dropdownItemHover: {
      backgroundColor: '#f0f0f0', // Hover effect
    },
    profileInfo: {
      padding: '0 1.5rem 2rem 3rem',
    },
    profileContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    },
    avatar: {
      width: '5rem',
      height: '5rem',
      backgroundColor: '#ffcc33',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.25rem',
      color: '#333333',
      border: '1px solid #000000',
    },
    name: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#000000',
      margin: '0',
    },
    settingsSection: {
      padding: '0 1.5rem 0 3rem',
      marginBottom: '4rem',
    },
    field: {
      marginBottom: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
    },
    label: {
      width: '84px',
      fontSize: '1.25rem',
      color: '#000000',
      paddingTop: '8px',
    },
    input: {
      width: '300px',
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      padding: '12px 15px',
      fontSize: '1rem',
    },
    editButton: {
      backgroundColor: '#f0f0f0',
      color: '#000000',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      padding: '0.5rem 1rem',
      minWidth: '80px',
      fontSize: '1rem',
      cursor: 'pointer',
    },
    optionsSection: {
      display: 'flex',
      padding: '0 1.5rem 0 3rem',
      gap: '2rem',
    },
    sectionColumn: {
      flex: 1,
      maxWidth: '29%',
    },
    sectionTitle: {
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: '#000000',
      fontSize: '1.25rem',
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
      fontSize: '1rem',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      accentColor: highContrastMode ? '#FF9B18' : undefined,
    },
    measurements: {
      marginBottom: '2rem',
    },
    measurementItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.75rem',
    },
    measurementLabel: {
      width: '60px',
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
    },
  };

  return (
    <div style={{ ...styles.container, ...(modeStyles.container || {}) }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ alignSelf: 'flex-start', marginBottom: '40px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
            }}
            onClick={handleBackToMap}
          >
            <span style={{ marginRight: '8px' }}>◀</span>
            Back to Map
          </button>
        </div>
        <div style={styles.iconsContainer} onClick={toggleDropdown}>
          <MenuIcon />
          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <Link
                to="/help"
                style={styles.dropdownItem}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    styles.dropdownItemHover.backgroundColor)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#ffffff')
                }
              >
                <HelpIcon />
                Help
              </Link>
              <div
                style={styles.dropdownItem}
                onClick={handleSignOut}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    styles.dropdownItemHover.backgroundColor)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#ffffff')
                }
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
            <label style={{ ...styles.label, ...(modeStyles.text || {}) }}>
              Email ID
            </label>
            <input
              style={{ ...styles.input, ...(modeStyles.input || {}) }}
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editEmail}
            />
            <button
              style={{ ...styles.editButton, ...(modeStyles.editButton || {}) }}
              onClick={() => setEditEmail(!editEmail)}
            >
              Edit
            </button>
          </div>
        </div>
        <div style={styles.field}>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.label, ...(modeStyles.text || {}) }}>
              Password
            </label>
            <input
              style={{ ...styles.input, ...(modeStyles.input || {}) }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!editPassword}
            />
            <button
              style={{ ...styles.editButton, ...(modeStyles.editButton || {}) }}
              onClick={() => setEditPassword(!editPassword)}
            >
              Edit
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
                style={styles.checkbox}
                id="accessible-routes"
              />
              <label htmlFor="accessible-routes">Use accessible routes ♿</label>
            </div>
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                id="screen-reader"
              />
              <label htmlFor="screen-reader">Screen reader 🔊</label>
            </div>
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                id="high-contrast"
                checked={highContrastMode}
                onChange={handleHighContrastChange}
              />
              <label htmlFor="high-contrast">High contrast mode 🌙</label>
            </div>
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                id="show-elevators"
              />
              <label htmlFor="show-elevators">Show elevators 🚻</label>
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div style={{ ...styles.sectionColumn, borderLeft: 'none' }}>
          <h3 style={{ ...styles.sectionTitle, ...(modeStyles.text || {}) }}>
            Lifestyle
          </h3>
          <div style={styles.measurements}>
            <div style={styles.measurementItem}>
              <label
                style={{ ...styles.measurementLabel, ...(modeStyles.text || {}) }}
              >
                Weight
              </label>
              <input
                type="text"
                style={{ ...styles.smallInput, ...(modeStyles.smallInput || {}) }}
              />
              <span style={{ ...(modeStyles.text || {}) }}>lbs</span>
            </div>
            <div style={styles.measurementItem}>
              <label
                style={{ ...styles.measurementLabel, ...(modeStyles.text || {}) }}
              >
                Height
              </label>
              <input
                type="text"
                style={{ ...styles.smallInput, ...(modeStyles.smallInput || {}) }}
              />
              <span style={{ ...(modeStyles.text || {}) }}>ft</span>
            </div>
            <div style={styles.measurementItem}>
              <label
                style={{ ...styles.measurementLabel, visibility: 'hidden' }}
              >
                Height
              </label>
              <input
                type="text"
                style={{ ...styles.smallInput, ...(modeStyles.smallInput || {}) }}
              />
              <span style={{ ...(modeStyles.text || {}) }}>in</span>
            </div>
          </div>
          <div style={styles.checkboxGroup}>
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                id="longer-routes"
              />
              <label htmlFor="longer-routes">Prioritize longer routes</label>
            </div>
            <div style={{ ...styles.checkboxItem, ...(modeStyles.text || {}) }}>
              <input type="checkbox" style={styles.checkbox} id="show-stats" />
              <label htmlFor="show-stats">Show steps and calories</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;