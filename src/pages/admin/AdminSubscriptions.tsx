import React from 'react';
import { CreditCard } from 'lucide-react';

const AdminSubscriptions: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Subscriptions
        </h1>
        <p className="text-muted-foreground">
          Manage operator subscriptions
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-display font-bold">0</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Trial</p>
          <p className="text-2xl font-display font-bold">0</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Expired</p>
          <p className="text-2xl font-display font-bold">0</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No subscriptions yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Operator subscriptions will appear here once operators subscribe.
        </p>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
