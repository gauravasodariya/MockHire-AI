import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
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
  
  console.log("[AuthContext] VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);

  // Listen for auth state changes (including redirects and popups)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AuthContext] Auth state changed:", firebaseUser);
      
      // If we already have a user from localStorage/checkAuth, skip to avoid duplicates
      if (firebaseUser && !user) {
        const name = firebaseUser.displayName;
        const email = firebaseUser.email;
        console.log("[AuthContext] Sending to backend:", { name, email });
        try {
          const backendResult = await axios.post(
            serverUrl + "/api/auth/google",
            { name, email }
          );
          console.log("[AuthContext] Backend response:", backendResult.data);
          setAuth(backendResult.data.user, backendResult.data.token);
        } catch (err) {
          console.error("[AuthContext] Backend auth error:", err);
        }
      }
      
      // If not logged in via Firebase, check localStorage
      if (!firebaseUser && !user) {
        setTimeout(() => checkAuth(), 100);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user]); // Add user to dependencies to check if we already have one

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
      // Sign out from Firebase first
      await signOut(auth);
      // Then call backend logout
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
