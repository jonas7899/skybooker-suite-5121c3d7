import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={user?.name} placeholder="Your name" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email} placeholder="Your email" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
