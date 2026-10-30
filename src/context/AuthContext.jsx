import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(undefined);

function extractApiError(error) {
  if (typeof error === "object" && error !== null) {
    const responseMessage = error.response?.data?.error || error.response?.data?.message;
    if (responseMessage) return responseMessage;
    if (error.code === "ERR_NETWORK") {
      return "Backend is not reachable. Please check your connection.";
    }
    if (error.message) return error.message;
  }
  return "Request failed. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    return typeof window !== "undefined" && !!localStorage.getItem("careeros_token");
  });

  const refreshProfile = async () => {
    try {
      const profile = await api.me();
      setUser(profile);
      return profile;
    } catch (err) {
      localStorage.removeItem("careeros_token");
      setUser(null);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("careeros_token");
    if (!token) return;

    refreshProfile()
      .catch(() => {
        localStorage.removeItem("careeros_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      localStorage.setItem("careeros_token", response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.register({ name, email, password });
      localStorage.setItem("careeros_token", response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const logout = () => {
    localStorage.removeItem("careeros_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
