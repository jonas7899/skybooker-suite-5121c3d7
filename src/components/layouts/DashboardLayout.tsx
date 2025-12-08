import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  Plane,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  CreditCard,
  Building2,
  UserCog,
  Ticket,
  Heart,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const DashboardLayout: React.FC = () => {
  const { user, profile, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    if (!userRole) return [];

    switch (userRole.role) {
      case 'super_admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: '/admin/operators', label: 'Operators', icon: <Building2 className="w-5 h-5" /> },
          { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
          { href: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" /> },
          { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
          { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        ];
      case 'operator_admin':
        return [
          { href: '/operator', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: '/operator/calendar', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
          { href: '/operator/flights', label: 'Flights', icon: <Plane className="w-5 h-5" /> },
          { href: '/operator/bookings', label: 'Bookings', icon: <Ticket className="w-5 h-5" /> },
          { href: '/operator/staff', label: 'Staff', icon: <UserCog className="w-5 h-5" /> },
          { href: '/operator/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
          { href: '/operator/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        ];
      case 'operator_staff':
        return [
          { href: '/operator', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: '/operator/flights', label: 'Flights', icon: <Plane className="w-5 h-5" /> },
          { href: '/operator/bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
          { href: '/operator/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        ];
      case 'user':
        return [
          { href: '/dashboard', label: 'My Flights', icon: <Ticket className="w-5 h-5" /> },
          { href: '/dashboard/bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
          { href: '/dashboard/favorites', label: 'Favorites', icon: <Heart className="w-5 h-5" /> },
          { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (!userRole) return null;
    const badges: Record<string, { label: string; className: string }> = {
      super_admin: { label: 'Super Admin', className: 'bg-destructive/10 text-destructive' },
      operator_admin: { label: 'Operator Admin', className: 'bg-primary/10 text-primary' },
      operator_staff: { label: 'Staff', className: 'bg-accent/10 text-accent' },
      user: { label: 'Member', className: 'bg-secondary text-secondary-foreground' },
    };
    const badge = badges[userRole.role];
    return badge ? (
      <span className={cn('text-xs px-2 py-1 rounded-full font-medium', badge.className)}>
        {badge.label}
      </span>
    ) : null;
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-sky flex items-center justify-center">
                <Plane className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-sidebar-foreground">
                SkyBook
              </span>
            </Link>
            <button
              className="lg:hidden p-1 text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="mt-2">
              {getRoleBadge()}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-4">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">View Site</Link>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
