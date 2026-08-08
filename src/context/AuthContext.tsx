import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

export type UserType = 'customer' | 'vendor' | 'admin';

type AuthContextType = {
  user: User | null;
  pendingRole: UserType | null;
  login: (identifier: string, password?: string, selectedRole?: UserType) => Promise<User>;
  logout: () => void;
  registerCustomer: (data: any, selectedRole?: UserType) => Promise<User>;
  registerVendor: (data: any, selectedRole?: UserType) => Promise<User>;
  clearPendingRole: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingRole, setPendingRole] = useState<UserType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('bidzo_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem('bidzo_user');
      }
    }
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

  const clearPendingRole = () => {
    setPendingRole(null);
  };

  const login = async (identifier: string, password?: string, selectedRole?: UserType) => {
    const resolvedType = selectedRole === 'vendor' ? 'vendor' : selectedRole === 'admin' ? 'admin' : identifier.toLowerCase().includes('vendor') ? 'vendor' : 'customer';
    const u = fakeUser({
      name: identifier.split('@')[0] || 'User',
      email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
      type: resolvedType,
      vendorVerified: resolvedType === 'vendor',
    });
    setUser(u);
    setPendingRole(null);
    return u;
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  const registerCustomer = async (data: any, selectedRole: UserType = 'customer') => {
    setPendingRole(selectedRole === 'vendor' ? 'vendor' : 'customer');
    const u = fakeUser({
      name: data.name || data.email,
      email: data.email,
      type: selectedRole === 'vendor' ? 'vendor' : 'customer',
    });
    setUser(null);
    return u;
  };

  const registerVendor = async (data: any, selectedRole: UserType = 'vendor') => {
    setPendingRole(selectedRole === 'vendor' ? 'vendor' : 'customer');
    const u = fakeUser({
      name: data.businessName || data.ownerName || data.email,
      email: data.email,
      type: selectedRole === 'vendor' ? 'vendor' : 'customer',
      vendorVerified: false,
    });
    setUser(null);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, pendingRole, login, logout, registerCustomer, registerVendor, clearPendingRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
