import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminOperators: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Operators
          </h1>
          <p className="text-muted-foreground">
            Manage flight operators on the platform
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Add Operator
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No operators yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Operators will appear here once they register on the platform.
        </p>
      </div>
    </div>
  );
};

export default AdminOperators;
