import React from 'react';
import { Plane, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OperatorFlights: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Flights
          </h1>
          <p className="text-muted-foreground">
            Manage your flight experiences
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Add Flight
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Plane className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No flights created yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Create your first flight experience and start accepting bookings.
        </p>
      </div>
    </div>
  );
};

export default OperatorFlights;
