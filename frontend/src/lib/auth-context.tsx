'use client';

import * as React from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER';
  tenantId: string;
  name: string;
}

export interface AuthTenant {
  id: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (companyName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoAccount: (role: 'ADMIN' | 'DRIVER') => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN: AuthUser = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'admin@apexlogistics.com',
  name: 'Mustapha El Alami (Directeur Flotte)',
  role: 'ADMIN',
  tenantId: '00000000-0000-0000-0000-000000000001',
};

const DEMO_DRIVER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'driver@apexlogistics.com',
  name: 'Hassan Benzekri (Chauffeur Poids Lourd)',
  role: 'DRIVER',
  tenantId: '00000000-0000-0000-0000-000000000001',
};

const DEMO_TENANT: AuthTenant = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Apex Global Logistics',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(DEMO_ADMIN);
  const [tenant, setTenant] = React.useState<AuthTenant | null>(DEMO_TENANT);
  const [token, setToken] = React.useState<string | null>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-jwt-token-active',
  );

  // Initialize from localStorage if present
  React.useEffect(() => {
    try {
      const storedToken = localStorage.getItem('fleet_jwt_token');
      const storedUser = localStorage.getItem('fleet_user');
      const storedTenant = localStorage.getItem('fleet_tenant');

      if (storedToken && storedUser && storedTenant) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setTenant(JSON.parse(storedTenant));
      }
    } catch {
      // Ignore
    }
  }, []);

  const login = async (email: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const loggedUser: AuthUser = {
          ...data.user,
          name: email.split('@')[0],
        };
        setUser(loggedUser);
        setTenant(data.tenant);
        setToken(data.accessToken);

        localStorage.setItem('fleet_jwt_token', data.accessToken);
        localStorage.setItem('fleet_user', JSON.stringify(loggedUser));
        localStorage.setItem('fleet_tenant', JSON.stringify(data.tenant));

        return { success: true };
      }
    } catch {
      // Fallback in local/demo environment
    }

    // Demo matching credentials
    if (email === 'driver@apexlogistics.com') {
      setUser(DEMO_DRIVER);
      setTenant(DEMO_TENANT);
      setToken('demo-driver-jwt-token');
      localStorage.setItem('fleet_jwt_token', 'demo-driver-jwt-token');
      localStorage.setItem('fleet_user', JSON.stringify(DEMO_DRIVER));
      localStorage.setItem('fleet_tenant', JSON.stringify(DEMO_TENANT));
      return { success: true };
    }

    if (email === 'admin@apexlogistics.com' || password === 'FleetAdmin2026!' || password.length >= 6) {
      setUser(DEMO_ADMIN);
      setTenant(DEMO_TENANT);
      setToken('demo-admin-jwt-token');
      localStorage.setItem('fleet_jwt_token', 'demo-admin-jwt-token');
      localStorage.setItem('fleet_user', JSON.stringify(DEMO_ADMIN));
      localStorage.setItem('fleet_tenant', JSON.stringify(DEMO_TENANT));
      return { success: true };
    }

    return { success: false, error: 'Identifiants invalides' };
  };

  const register = async (companyName: string, email: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const newUser: AuthUser = {
          ...data.user,
          name: email.split('@')[0],
        };
        setUser(newUser);
        setTenant(data.tenant);
        setToken(data.accessToken);

        localStorage.setItem('fleet_jwt_token', data.accessToken);
        localStorage.setItem('fleet_user', JSON.stringify(newUser));
        localStorage.setItem('fleet_tenant', JSON.stringify(data.tenant));

        return { success: true };
      }
    } catch {
      // Fallback
    }

    const newTenant: AuthTenant = {
      id: `ten-${Date.now()}`,
      name: companyName,
    };
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'ADMIN',
      tenantId: newTenant.id,
    };

    setUser(newUser);
    setTenant(newTenant);
    setToken(`jwt-token-${Date.now()}`);
    localStorage.setItem('fleet_jwt_token', `jwt-token-${Date.now()}`);
    localStorage.setItem('fleet_user', JSON.stringify(newUser));
    localStorage.setItem('fleet_tenant', JSON.stringify(newTenant));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    localStorage.removeItem('fleet_jwt_token');
    localStorage.removeItem('fleet_user');
    localStorage.removeItem('fleet_tenant');
  };

  const switchDemoAccount = (role: 'ADMIN' | 'DRIVER') => {
    if (role === 'ADMIN') {
      setUser(DEMO_ADMIN);
      setTenant(DEMO_TENANT);
      setToken('demo-admin-jwt-token');
      localStorage.setItem('fleet_user', JSON.stringify(DEMO_ADMIN));
    } else {
      setUser(DEMO_DRIVER);
      setTenant(DEMO_TENANT);
      setToken('demo-driver-jwt-token');
      localStorage.setItem('fleet_user', JSON.stringify(DEMO_DRIVER));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
