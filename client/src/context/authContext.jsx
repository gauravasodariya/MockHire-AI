import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { serverUrl } from "../App";

const AuthContext = createContext();

// Helper to get auth headers with Bearer token
export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${serverUrl}/api/user/currentUser`, {
        headers: getAuthHeaders(),
      });
      setUser(res.data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Helper to set both user and token
  const setAuth = (userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem("authToken", token);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      localStorage.removeItem("authToken");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, setAuth, loading, checkAuth, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
