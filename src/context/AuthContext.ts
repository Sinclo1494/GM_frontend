import { createContext } from "react";
import type { UserInfo } from "../types/user";

export interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  setUser: (user: UserInfo | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);