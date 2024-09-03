import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserIdFromToken = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.id; // Adjust this based on the structure of your token
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  };

  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      return (decodedToken.exp * 1000 < Date.now());
    } catch (err) {
      console.error('Invalid token', error);
      return true;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('authToken');
        setUserId(null);
        setIsAuthenticated(false);
      } else {
        setUserId(getUserIdFromToken(token));
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  const login = (authToken) => {
    localStorage.setItem('authToken', authToken);
    setUserId(getUserIdFromToken(authToken));
    setIsAuthenticated(true);
  }
  const logout = () => {
    localStorage.removeItem('authToken');
    setUserId(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}