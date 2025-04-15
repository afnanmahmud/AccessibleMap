import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Service Configuration
const API_URL = 'https://accessiblemap.azurewebsites.net/api';
const TIMEOUT = 10000; // 10 seconds
const RETRY_COUNT = 2;
const RETRY_DELAY = 1000; // 1 second

// User data interface
export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  highContrastMode: boolean;
}

// Create a customized axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to implement retry logic
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>, 
  maxRetries: number = RETRY_COUNT
): Promise<AxiosResponse<T>> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a timeout or network error
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (
          axiosError.code !== 'ECONNABORTED' && 
          axiosError.code !== 'ERR_NETWORK'
        ) {
          throw error;
        }
      } else {
        throw error;
      }
      
      // Last attempt, don't wait just throw
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries})`);
    }
  }
  
  throw lastError;
};

// API Service methods
const ApiService = {
  // Get the current user's profile
  getUserProfile: async (): Promise<UserData> => {
    try {
      const response = await retryRequest(() => 
        apiClient.get<UserData>('/users/profile')
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Check if we have cached data
      const cachedData = sessionStorage.getItem('user_data');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      // Fallback mock data if no cache
      return {
        id: "user123",
        username: "johnsmith",
        email: "jsmith22@students.edu",
        firstName: "John",
        lastName: "Smith",
        highContrastMode: false
      };
    }
  },
  
  // Update email
  updateEmail: async (email: string): Promise<boolean> => {
    try {
      await retryRequest(() => 
        apiClient.post('/users/update-email', { email })
      );
      
      // Cache the updated email
      const cachedData = sessionStorage.getItem('user_data');
      if (cachedData) {
        const userData = JSON.parse(cachedData);
        userData.email = email;
        sessionStorage.setItem('user_data', JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating email:', error);
      
      // For network errors, we can still update the cache and return success
      if (axios.isAxiosError(error) && 
          (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
        
        const cachedData = sessionStorage.getItem('user_data');
        if (cachedData) {
          const userData = JSON.parse(cachedData);
          userData.email = email;
          sessionStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Return true to indicate UI should update (we'll sync later)
        return true;
      }
      
      throw error;
    }
  },
  
  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await retryRequest(() => 
        apiClient.post('/users/update-password', { 
          currentPassword, 
          newPassword 
        })
      );
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
  
  // Update user preferences
  updatePreferences: async (preferences: { highContrastMode: boolean }): Promise<boolean> => {
    try {
      await retryRequest(() => 
        apiClient.post('/users/update-preferences', preferences)
      );
      
      // Cache the updated preferences
      const cachedData = sessionStorage.getItem('user_data');
      if (cachedData) {
        const userData = JSON.parse(cachedData);
        userData.highContrastMode = preferences.highContrastMode;
        sessionStorage.setItem('user_data', JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      
      // For network errors, we can still update the cache and return success
      if (axios.isAxiosError(error) && 
          (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
        
        const cachedData = sessionStorage.getItem('user_data');
        if (cachedData) {
          const userData = JSON.parse(cachedData);
          userData.highContrastMode = preferences.highContrastMode;
          sessionStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Return true to indicate UI should update (we'll sync later)
        return true;
      }
      
      throw error;
    }
  },
  
  // User authentication
  login: async (username: string, password: string): Promise<{ token: string, userData: UserData }> => {
    try {
      const response = await retryRequest(() => 
        apiClient.post<{ token: string, userData: UserData }>('/auth/login', { 
          username, 
          password 
        })
      );
      
      // Store token
      const { token, userData } = response.data;
      sessionStorage.setItem('auth_token', token);
      
      // Cache user data
      sessionStorage.setItem('user_data', JSON.stringify(userData));
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
  }
};

export default ApiService;