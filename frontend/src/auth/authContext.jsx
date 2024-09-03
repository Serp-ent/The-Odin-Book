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

  useEffect(() => {

    const token = localStorage.getItem('authToken');
    if (token) {
      setUserId(getUserIdFromToken(token));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // TODO: if authToken expired remove it from localStorage
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