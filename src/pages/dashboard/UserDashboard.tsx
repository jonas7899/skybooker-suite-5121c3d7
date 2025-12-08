import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Calendar, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { profile } = useAuth();

  const quickStats = [
    { label: 'Upcoming Flights', value: '0', icon: <Ticket className="w-5 h-5" /> },
    { label: 'Past Bookings', value: '0', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Saved Experiences', value: '0', icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Ready for your next adventure?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-6 border border-border shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl gradient-sky flex items-center justify-center mx-auto mb-6">
          <Ticket className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No flights booked yet
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Discover amazing flight experiences from our verified operators and book your next adventure.
        </p>
        <Button variant="gradient" asChild>
          <Link to="/experiences">
            Browse Experiences
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default UserDashboard;
