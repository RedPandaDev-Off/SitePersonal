
import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "./authTypes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    const storedToken = localStorage.getItem("authToken");
    if (storedUser && storedToken) {
      setTimeout(() => {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setLoading(false);
      }, 0);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    localStorage.setItem("authToken", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("adminUser");
    localStorage.removeItem("authToken");
  };

  const getAuthHeaders = () => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, getAuthHeaders }}>
      {loading ? <div>Chargement...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
