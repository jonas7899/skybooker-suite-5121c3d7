import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Calendar, Users, TrendingUp } from 'lucide-react';

const OperatorDashboard: React.FC = () => {
  const { profile, userRole } = useAuth();

  const stats = [
    { label: 'Active Flights', value: '0', icon: <Plane className="w-5 h-5" />, trend: '+0%' },
    { label: 'Total Bookings', value: '0', icon: <Calendar className="w-5 h-5" />, trend: '+0%' },
    { label: 'Customers', value: '0', icon: <Users className="w-5 h-5" />, trend: '+0%' },
    { label: 'Revenue', value: '0 HUF', icon: <TrendingUp className="w-5 h-5" />, trend: '+0%' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Operator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.full_name || 'Operator'}
          {userRole?.role === 'operator_admin' && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              Admin
            </span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-6 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {stat.icon}
              </div>
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <p className="text-muted-foreground text-sm">
            No recent bookings to display.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Flights</h2>
          <p className="text-muted-foreground text-sm">
            No upcoming flights scheduled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
