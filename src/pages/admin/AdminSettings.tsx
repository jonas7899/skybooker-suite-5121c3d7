import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6">General Settings</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input id="platformName" defaultValue="SkyBook" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input id="supportEmail" type="email" defaultValue="support@skybook.com" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">Save Changes</Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Pricing</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Operator subscription pricing
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyPrice">Monthly Price (HUF)</Label>
            <Input id="monthlyPrice" type="number" defaultValue="9999" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trialDays">Trial Period (days)</Label>
            <Input id="trialDays" type="number" defaultValue="14" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">Update Pricing</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
