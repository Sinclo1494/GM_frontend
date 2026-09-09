import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { ReactNode } from "react";
import type { UserInfo } from "../types/user";
import { getCurrentUser } from "../api/userService";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (token) {
      getCurrentUser()
        .then((current) => {
          if (!cancelled) setUser(current);
        })
        .catch(() => {
          if (!cancelled) setUser(null);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    setToken(access);
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};