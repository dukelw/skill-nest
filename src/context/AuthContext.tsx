"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "~/services/authService";
import { getAccessToken } from "~/utils/token";

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

type AuthContextType = {
  user: User | null;
  tokens: Tokens | null;
  setUser: (user: User | null) => void;
  setTokens: (tokens: Tokens | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  tokens: null,
  setUser: () => {},
  setTokens: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const data = await authService.getProfile();
          setUser(data.user);
          setTokens(data.tokens);
        } catch (err) {
          console.error("Token không hợp lệ:", err);
          setUser(null);
          setTokens(null);
        }
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, setUser, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
