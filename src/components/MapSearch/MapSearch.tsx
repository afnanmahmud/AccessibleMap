import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MapSearch.css';

interface Location {
  name: string;
  coordinates: [number, number];
}

interface MapSearchProps {
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onSubmit: () => void;
  locations: Location[]; // Added locations prop
}

const MapSearch: React.FC<MapSearchProps> = ({ onStartChange, onEndChange, onSubmit, locations }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState<Location[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Location[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const startInputRef = useRef<HTMLDivElement>(null);
  const endInputRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility for menu button
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle navigation for dropdown menu options
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  // Filter suggestions based on input
  const filterSuggestions = (input: string, setSuggestions: React.Dispatch<React.SetStateAction<Location[]>>) => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    const filtered = locations.filter((location) =>
      location.name.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered);
  };

  // Handle Start input change
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartValue(value);
    onStartChange(value);
    filterSuggestions(value, setStartSuggestions);
    setShowStartSuggestions(true);
  };

  // Handle End input change
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndValue(value);
    onEndChange(value);
    filterSuggestions(value, setEndSuggestions);
    setShowEndSuggestions(true);
  };

  // Handle suggestion selection for Start
  const handleStartSuggestionClick = (location: Location) => {
    setStartValue(location.name);
    onStartChange(location.name);
    setShowStartSuggestions(false);
    setStartSuggestions([]);
  };

  // Handle suggestion selection for End
  const handleEndSuggestionClick = (location: Location) => {
    setEndValue(location.name);
    onEndChange(location.name);
    setShowEndSuggestions(false);
    setEndSuggestions([]);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close menu dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close start suggestions
      if (startInputRef.current && !startInputRef.current.contains(event.target as Node)) {
        setShowStartSuggestions(false);
      }
      // Close end suggestions
      if (endInputRef.current && !endInputRef.current.contains(event.target as Node)) {
        setShowEndSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="map-search-container">
      <div className="input-group">
        <div className="input-container" ref={startInputRef}>
          <input
            type="text"
            value={startValue}
            onChange={handleStartChange}
            placeholder="Start"
            className="map-search-input start-input"
          />
          {showStartSuggestions && startSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {startSuggestions.map((location) => (
                <div
                  key={location.name}
                  className="suggestion-item"
                  onClick={() => handleStartSuggestionClick(location)}
                >
                  {location.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dots-icon">
          <span className="dot blue-dot"></span>
          <span className="dot gray-dot"></span>
          <span className="dot gray-dot"></span>
          <span className="dot gray-dot"></span>
          <span className="dot red-dot"></span>
        </div>
        <div className="input-container" ref={endInputRef}>
          <input
            type="text"
            value={endValue}
            onChange={handleEndChange}
            placeholder="End"
            className="map-search-input end-input"
          />
          {showEndSuggestions && endSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {endSuggestions.map((location) => (
                <div
                  key={location.name}
                  className="suggestion-item"
                  onClick={() => handleEndSuggestionClick(location)}
                >
                  {location.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="button-group">
        <button onClick={onSubmit} className="map-search-button">
          Start
        </button>
        <button className="bookmark-button">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFC107"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <div className="menu-button-container" ref={dropdownRef}>
          <button className="menu-button" onClick={toggleDropdown}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => handleNavigation('/profile')}
              >
                Preferences
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation('/help')}
              >
                Help
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation('/login')}
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSearch;