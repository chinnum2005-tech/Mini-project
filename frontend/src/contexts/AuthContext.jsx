import { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mentorStatus, setMentorStatus] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Development bypass - check if we want to bypass auth
        const bypassAuth = localStorage.getItem("bypassAuth");
        if (bypassAuth === "true") {
          const testUser = {
            id: 1,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            campusVerified: true,
            profileComplete: false
          };
          setUser(testUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const response = await axiosInstance.get("/api/auth/me");
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Check mentor status if user is mentor type
      if (response.data.user?.userType === 'mentor') {
        checkMentorStatus();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkMentorStatus = async () => {
    try {
      const response = await axiosInstance.get("/api/mentor-verification/can-access-mentor");
      setMentorStatus(response.data.data);
    } catch (error) {
      console.error("Mentor status check failed:", error);
    }
  };

  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setIsAuthenticated(true);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // Check mentor status if user is mentor type
    if (userData?.userType === 'mentor') {
      checkMentorStatus();
    }
  };

  // Development login bypass
  const devLogin = () => {
    const testUser = {
      id: 1,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      campusVerified: true,
      profileComplete: false
    };
    localStorage.setItem("bypassAuth", "true");
    setUser(testUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("bypassAuth");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    setMentorStatus(null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    mentorStatus,
    login,
    logout,
    devLogin, // Add devLogin to the context
    checkAuthStatus,
    checkMentorStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};