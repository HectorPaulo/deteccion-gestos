"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simula la verificación de autenticación (puedes usar cookies o tokens aquí)
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  const login = () => {
    localStorage.setItem("authToken", "your-token");
    setIsAuthenticated(true);
    router.push("/"); // Redirige al usuario después de iniciar sesión
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};