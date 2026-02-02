import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../@types';
import { getToken, getUser, setToken as saveToken, setUser as saveUser, logout as logoutUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean; 
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {  // ← FIX: children (lowercase)
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ← FIX: useEffect INSIDE component
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  // ← FIX: Functions INSIDE component
  const handleLogin = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    saveToken(newToken);
    saveUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    logoutUser();
  };

  // ← FIX: Return statement
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!token && !!user,  // ← FIX: typo & check both
        isLoading,
      }}
    >
      {children}  
    </AuthContext.Provider>
  );
}