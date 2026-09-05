import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { login as loginApi, authMe, register as registerApi, getStoredVendorProfileId, resolveVendorProfileId, setStoredVendorProfileId } from '../api/authApi';
import { getStoredAuthToken, handleUnauthorized, isJwtExpired, resetAuthExpirationHandling } from '../api/apiClient';

export type UserType = 'customer' | 'vendor' | 'admin' | 'delivery' | 'support';

type AuthContextType = {
  user: User | null;
  authReady: boolean;
  pendingRole: UserType | null;
  login: (identifier: string, password?: string, selectedRole?: UserType) => Promise<User>;
  logout: () => void;
  clearSession: () => void;
  registerCustomer: (data: any, selectedRole?: UserType) => Promise<any>;
  registerVendor: (data: any, selectedRole?: UserType) => Promise<any>;
  clearPendingRole: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem('bidzo_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      window.localStorage.removeItem('bidzo_user');
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ role?: string; type?: UserType }>).detail;
      setUser(null);
      setPendingRole(null);
    };

    window.addEventListener('bidzo:session-expired', handleSessionExpired);
    return () => window.removeEventListener('bidzo:session-expired', handleSessionExpired);
  }, [navigate]);

  useEffect(() => {
    if (!authReady) return;
    if (typeof window === 'undefined') return;

    if (user) {
      window.localStorage.setItem('bidzo_user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('bidzo_user');
    }
  }, [authReady, user]);

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
    if (!password) {
      throw new Error('Password is required');
    }

    const loginResponse = await loginApi({
      email: identifier,
      password,
    });

    const me = await authMe(loginResponse.token);
    const role = me.role || loginResponse.role || 'CUSTOMER';
    const type: UserType = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'FRANCHISE_ADMIN'
      ? 'admin'
      : role === 'VENDOR'
        ? 'vendor'
        : role === 'SUPER_ADMIN' || role === 'FRANCHISE_ADMIN'
        ? 'admin'
        : role === 'DELIVERY_PARTNER'
          ? 'delivery'
          : role === 'SUPPORT'
            ? 'support'
            : 'customer';

    if (selectedRole && (selectedRole === 'customer' || selectedRole === 'vendor') && type !== selectedRole) {
      localStorage.removeItem('bidzo_user');
      localStorage.removeItem('bidzo_vendor_profile_id');
      throw new Error(`These credentials belong to a ${type} account. Select ${type === 'vendor' ? 'Vendor' : 'Customer'} login to continue.`);
    }

    const displayName = me.name || me.username || (me.email ? me.email.split('@')[0] : 'User');
    const resolvedVendorId = resolveVendorProfileId(me);
    if (resolvedVendorId !== undefined && resolvedVendorId !== null && resolvedVendorId !== '') {
      setStoredVendorProfileId(String(resolvedVendorId));
    }

    const userId = me.userId ?? me.id ?? loginResponse.userId ?? undefined;
    const u: User = {
      id: String(userId ?? me.id ?? loginResponse.userId ?? 'unknown-user'),
      userId: userId ?? me.id ?? loginResponse.userId,
      name: displayName,
      username: me.username,
      email: me.email,
      phone: me.phone,
      role,
      type,
      token: loginResponse.token,
      vendorId: resolvedVendorId !== undefined && resolvedVendorId !== null && resolvedVendorId !== '' ? String(resolvedVendorId) : undefined,
      vendorProfileId: resolvedVendorId !== undefined && resolvedVendorId !== null && resolvedVendorId !== '' ? String(resolvedVendorId) : undefined,
    };
    if (import.meta.env.DEV) {
      console.debug('[Bidzo auth] auth-me and final user', {
        authMeRole: me.role,
        userRole: u.role,
        userType: u.type,
      });
    }
    setUser(u);
    resetAuthExpirationHandling();
    setPendingRole(null);
    return u;
  };

  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bidzo_user');
    localStorage.removeItem('bidzo_vendor_profile_id');
  }, []);

  const logout = () => {
    const destination = user && ['ADMIN', 'SUPER_ADMIN', 'FRANCHISE_ADMIN'].includes(user.role || '') ? '/admin/login' : '/login';
    clearSession();
    navigate(destination, { replace: true });
  };

  const registerCustomer = async (data: any, selectedRole: UserType = 'customer') => {
    setPendingRole('customer');
    if (!data?.name || !data?.email || !data?.password || !data?.phone) {
      throw new Error('Name, email, password, and phone number are required');
    }

    return registerApi({
      username: data.name,
      email: data.email,
      password: data.password,
      role: 'CUSTOMER',
      phoneNumber: data.phone,
    });
  };

  const registerVendor = async (data: any, selectedRole: UserType = 'vendor') => {
    setPendingRole('vendor');
    if (!data?.businessName || !data?.email || !data?.password || !data?.phone) {
      throw new Error('Business name, email, password, and phone number are required');
    }

    return registerApi({
      username: data.businessName,
      email: data.email,
      password: data.password,
      role: 'VENDOR',
      phoneNumber: data.phone,
    });
  };

  return (
    <AuthContext.Provider value={{ user, authReady, pendingRole, login, logout, clearSession, registerCustomer, registerVendor, clearPendingRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
