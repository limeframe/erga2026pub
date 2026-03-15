"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserInfo, UserRole } from "@/lib/types";
import { login as apiLogin } from "@/lib/api";

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: UserInfo | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: "guest",
    user: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("userInfo");
    if (token && stored) {
      try {
        const user: UserInfo = JSON.parse(stored);
        setState({ isAuthenticated: true, role: user.role, user });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("userInfo", JSON.stringify(data.user));
    setState({ isAuthenticated: true, role: data.user.role, user: data.user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setState({ isAuthenticated: false, role: "guest", user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
