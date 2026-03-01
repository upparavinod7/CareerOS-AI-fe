import { createContext, type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractApiError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: { data?: { error?: string; message?: string } };
      code?: string;
      message?: string;
    };

    const responseMessage = maybeError.response?.data?.error || maybeError.response?.data?.message;
    if (responseMessage) return responseMessage;
    if (maybeError.code === "ERR_NETWORK") {
      return "Backend is not reachable at http://localhost:5001. Start server and retry.";
    }
    if (maybeError.message) return maybeError.message;
  }

  return "Request failed";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const profile = await api.me();
    setUser(profile);
  };

  useEffect(() => {
    const token = localStorage.getItem("careeros_token");
    if (!token) {
      setLoading(false);
      return;
    }

    refreshProfile()
      .catch(() => {
        localStorage.removeItem("careeros_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      localStorage.setItem("careeros_token", response.token);
      setUser(response.user);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.register({ name, email, password });
      localStorage.setItem("careeros_token", response.token);
      setUser(response.user);
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
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

