import React from 'react';
import { Calendar } from 'lucide-react';

const UserBookings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          My Bookings
        </h1>
        <p className="text-muted-foreground">
          View and manage your flight bookings
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No bookings yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your booking history will appear here once you make your first reservation.
        </p>
      </div>
    </div>
  );
};

export default UserBookings;
