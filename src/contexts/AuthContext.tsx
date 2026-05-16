import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Admin } from "../types";

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedAdmin = localStorage.getItem("admin_data");
    if (storedToken && storedAdmin) {
      try {
        // Decode JWT payload (base64) to check expiry
        const parts = storedToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setAdmin(JSON.parse(storedAdmin));
          } else {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_data");
          }
        }
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
      }
    }
  }, []);

  const login = (newToken: string, newAdmin: Admin) => {
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_data", JSON.stringify(newAdmin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
