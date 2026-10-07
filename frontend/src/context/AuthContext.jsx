import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ===================================
  // GET CURRENT USER
  // ===================================

  const getMe = async () => {
    try {
      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // ===================================
  // LOGIN
  // ===================================

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);

    return response.data.user;
  };

  // ===================================
  // REGISTER
  // ===================================

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);

    setUser(response.data.user);

    return response.data.user;
  };

  // ===================================
  // LOGOUT
  // ===================================

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        logout,
        getMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
