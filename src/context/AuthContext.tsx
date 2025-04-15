import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Define the User and Authentication types
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  highContrastMode: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUserData: (userData: User) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  setUserData: () => {},
});

// Create the Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing token on app load
  useEffect(() => {
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch user profile with token and handle offline scenarios
  const fetchUserProfile = async (authToken: string) => {
    try {
      setIsLoading(true);
      
      // Try to get cached user data first
      const cachedUserData = sessionStorage.getItem('user_data');
      let userData: User | null = null;
      
      if (cachedUserData) {
        userData = JSON.parse(cachedUserData);
        // Set the cached data immediately so UI can render
        setUser(userData);
      }
      
      try {
        // Try to get fresh data from API
        const response = await axios.get<User>(
          'https://accessiblemap.azurewebsites.net/api/users/profile',
          {
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 5000 // 5 second timeout
          }
        );
        
        // Update with fresh data
        userData = response.data;
        setUser(userData);
        
        // Cache the data for offline use
        sessionStorage.setItem('user_data', JSON.stringify(userData));
      } catch (error) {
        console.warn('Failed to fetch fresh user profile, using cached data', error);
        // If we have no data at all, logout
        if (!userData) {
          logout();
        }
      }
    } catch (error) {
      console.error('Failed to handle user authentication', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call your login API
      const response = await axios.post(
        'https://accessiblemap.azurewebsites.net/api/auth/login',
        { username, password },
        { timeout: 5000 }
      );
      
      const { token: authToken, userData } = response.data;
      
      // Store token in session storage
      sessionStorage.setItem('auth_token', authToken);
      setToken(authToken);
      
      // If the API returns user data with the token, use it
      if (userData) {
        setUser(userData);
        sessionStorage.setItem('user_data', JSON.stringify(userData));
      } else {
        // Otherwise fetch the user profile
        await fetchUserProfile(authToken);
      }
      
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };
  
  // Update user data (used when profile is updated)
  const setUserData = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('user_data', JSON.stringify(userData));
  };
  
  // Provide the context value
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    setUserData
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for using the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;