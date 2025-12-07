import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasPermission } from '@/types/auth';

const OperatorStaff: React.FC = () => {
  const { user } = useAuth();
  const canManageStaff = user ? hasPermission(user.role, 'manage_operator_staff') : false;

  if (!canManageStaff) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">
            Access Restricted
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have permission to manage staff members. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage your team members
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Invite Staff
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No staff members yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Invite team members to help manage bookings and flights.
        </p>
      </div>
    </div>
  );
};

export default OperatorStaff;
