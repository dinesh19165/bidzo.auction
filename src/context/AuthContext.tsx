import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

export type UserType = 'customer' | 'vendor' | 'admin';

type AuthContextType = {
  user: User | null;
  login: (identifier: string, password?: string) => Promise<User>;
  logout: () => void;
  registerCustomer: (data: any) => Promise<User>;
  registerVendor: (data: any) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('bidzo_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('bidzo_user', JSON.stringify(user));
    else localStorage.removeItem('bidzo_user');
  }, [user]);

  const fakeUser = (overrides: Partial<User> = {}): User => ({
    id: String(Math.floor(Math.random() * 100000)),
    name: overrides.name || 'New User',
    email: overrides.email || 'user@example.com',
    type: (overrides.type as UserType) || 'customer',
    avatar: overrides.avatar || undefined,
    vendorVerified: overrides.vendorVerified || false,
  });

  const login = async (identifier: string) => {
    // Mock login: accept any identifier, set as customer unless contains 'vendor'
    const isVendor = identifier.toLowerCase().includes('vendor');
    const u = fakeUser({ name: identifier.split('@')[0] || 'User', email: identifier.includes('@') ? identifier : `${identifier}@example.com`, type: isVendor ? 'vendor' : 'customer', vendorVerified: isVendor ? true : false });
    setUser(u);
    return u;
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  const registerCustomer = async (data: any) => {
    const u = fakeUser({ name: data.name || data.email, email: data.email, type: 'customer' });
    setUser(u);
    return u;
  };

  const registerVendor = async (data: any) => {
    const u = fakeUser({ name: data.businessName || data.ownerName || data.email, email: data.email, type: 'vendor', vendorVerified: false });
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerCustomer, registerVendor }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
