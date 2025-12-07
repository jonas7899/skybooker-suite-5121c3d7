// User roles for the flight booking SaaS
export type UserRole = 'super_admin' | 'operator_admin' | 'operator_staff' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  operatorId?: string; // For operator_admin and operator_staff
  createdAt: Date;
}

export interface Operator {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  createdAt: Date;
}

// Role-based permissions
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    'manage_operators',
    'manage_all_users',
    'view_platform_analytics',
    'manage_subscriptions',
    'access_super_admin_dashboard',
  ],
  operator_admin: [
    'manage_operator_settings',
    'manage_operator_staff',
    'manage_flights',
    'manage_bookings',
    'view_operator_analytics',
    'access_operator_dashboard',
  ],
  operator_staff: [
    'view_flights',
    'manage_bookings',
    'view_operator_analytics',
    'access_operator_dashboard',
  ],
  user: [
    'browse_experiences',
    'make_bookings',
    'view_own_bookings',
    'manage_profile',
    'access_user_dashboard',
  ],
};

// Helper to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: string): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};

// Helper to check if user can access a specific dashboard
export const canAccessDashboard = (role: UserRole, dashboard: 'super_admin' | 'operator' | 'user'): boolean => {
  switch (dashboard) {
    case 'super_admin':
      return role === 'super_admin';
    case 'operator':
      return role === 'operator_admin' || role === 'operator_staff';
    case 'user':
      return role === 'user';
    default:
      return false;
  }
};
