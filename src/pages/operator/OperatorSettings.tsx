import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const OperatorSettings: React.FC = () => {
  const { userRole } = useAuth();
  const canManageSettings = userRole?.role === 'operator_admin';

  if (!canManageSettings) {
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
            You don't have permission to manage operator settings. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Operator Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your company settings
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6">Company Information</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" placeholder="Your company name" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input id="contactEmail" type="email" placeholder="contact@company.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+36 1 234 5678" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">Save Changes</Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Subscription</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your current plan and billing details
        </p>
        
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Professional Plan</p>
              <p className="text-sm text-muted-foreground">9,999 HUF/month</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorSettings;
