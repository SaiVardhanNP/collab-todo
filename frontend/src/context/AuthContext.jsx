import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// This is the most robust way to handle auth tokens.
// This "interceptor" runs before EVERY request is sent.
// It reads the token fresh from localStorage each time.
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from storage.
    const token = localStorage.getItem('token');
    
    // If the token exists, attach it to the request's Authorization header.
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    // If there's an error in setting up the request, reject the promise.
    return Promise.reject(error);
  }
);


const AuthProvider = ({ children }) => {
  // Initialize state directly from localStorage to stay logged in on refresh.
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data.token) {
      const receivedToken = response.data.token;
      // Save the token to localStorage. The interceptor will handle the rest.
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      return true;
    }
    return false;
  };

  const register = async (username, password) => {
    // This function remains the same.
    await apiClient.post('/auth/register', { username, password });
    return true;
  };

  const logout = () => {
    // Clear the token from localStorage and from the component's state.
    localStorage.removeItem('token');
    setToken(null);
  };

  const contextValue = {
    token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, apiClient };