"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import { User, Role } from "./types";

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard/admin",
  guru: "/dashboard/guru",
  siswa: "/dashboard/siswa",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("aksara_token");
    const savedUser = localStorage.getItem("aksara_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const data = await api<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    localStorage.setItem("aksara_token", data.access_token);
    localStorage.setItem("aksara_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    router.push(ROLE_HOME[data.user.role]);
  }

  function logout() {
    localStorage.removeItem("aksara_token");
    localStorage.removeItem("aksara_user");
    setToken(null);
    setUser(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
