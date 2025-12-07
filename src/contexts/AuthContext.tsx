import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Demo function to switch roles for testing
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing navigation
const demoUsers: Record<UserRole, User> = {
  super_admin: {
    id: '1',
    email: 'admin@skybook.com',
    name: 'Platform Admin',
    role: 'super_admin',
    createdAt: new Date(),
  },
  operator_admin: {
    id: '2',
    email: 'operator@blueskies.com',
    name: 'Blue Skies Owner',
    role: 'operator_admin',
    operatorId: 'op-1',
    createdAt: new Date(),
  },
  operator_staff: {
    id: '3',
    email: 'staff@blueskies.com',
    name: 'Staff Member',
    role: 'operator_staff',
    operatorId: 'op-1',
    createdAt: new Date(),
  },
  user: {
    id: '4',
    email: 'user@example.com',
    name: 'John Traveler',
    role: 'user',
    createdAt: new Date(),
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // For demo, log in as regular user
    setUser(demoUsers.user);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  // Demo function to switch roles
  const setDemoRole = (role: UserRole) => {
    setUser(demoUsers[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
