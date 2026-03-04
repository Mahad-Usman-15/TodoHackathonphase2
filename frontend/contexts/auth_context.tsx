"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User, RegisterRequest, LoginRequest } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  const redirectToLogin = useCallback(() => {
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get current user with existing in-memory access token
        const userData = await api.getMe();
        setUser(userData);
      } catch {
        // Try silent token refresh (only works if browser has a valid refresh token cookie)
        try {
          await api.refreshToken();
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          // Both failed — user is not authenticated (new visitor, no cookies, or cold-start)
          // Do NOT set sessionExpired here — we can't distinguish "no session" from "expired session"
          // sessionExpired is set only by the auth:unauthorized event during active use
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Fires when an active API call returns 401 — user WAS authenticated, session lapsed mid-use
    const handleUnauthorized = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep-alive: ping health endpoint every 14 minutes when authenticated
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      api.healthPing();
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (data: LoginRequest) => {
    const response = await api.login(data);
    setUser(response.user);
    setSessionExpired(false);
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.register(data);
    setUser(response.user);
    setSessionExpired(false);
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        sessionExpired,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
