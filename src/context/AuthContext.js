// context/AuthContext.js

'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('reveste_token');
        const storedUser = localStorage.getItem('reveste_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Falha ao carregar dados de autenticação do localStorage", error);
        localStorage.removeItem('reveste_token');
        localStorage.removeItem('reveste_user');
      }
    }
    setIsLoading(false);
  }, []);

  // --- ALTERAÇÃO AQUI ---
  // A função `login` agora aceita um terceiro argumento `redirectPath`.
  // Por padrão, ela redireciona para '/my-account', mantendo o comportamento antigo.
  // Se `redirectPath` for `null` ou `false`, o redirecionamento não acontece.
  const login = (userData, authToken, redirectPath = '/my-account') => {
    localStorage.setItem('reveste_token', authToken);
    localStorage.setItem('reveste_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);

    // Só redireciona se um caminho for fornecido (que é o comportamento padrão).
    // No checkout, passaremos `null` para evitar este redirecionamento.
    if (redirectPath) {
        router.push(redirectPath);
    }
  };

  const logout = () => {
    localStorage.removeItem('reveste_token');
    localStorage.removeItem('reveste_user');
    setToken(null);
    setUser(null);
    router.push('/auth');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};