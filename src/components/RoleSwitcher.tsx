import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const roles: { role: UserRole; label: string; description: string }[] = [
  { role: 'super_admin', label: 'Super Admin', description: 'Platform owner' },
  { role: 'operator_admin', label: 'Operator Admin', description: 'Flight company owner' },
  { role: 'operator_staff', label: 'Operator Staff', description: 'Limited admin' },
  { role: 'user', label: 'User', description: 'Customer' },
];

const RoleSwitcher: React.FC = () => {
  const { user, setDemoRole, logout } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-xs">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
          Demo: Switch Role
        </p>
        <div className="grid grid-cols-2 gap-2">
          {roles.map(({ role, label }) => (
            <Button
              key={role}
              size="sm"
              variant={user?.role === role ? 'default' : 'outline'}
              className={cn(
                "text-xs",
                user?.role === role && "gradient-sky"
              )}
              onClick={() => setDemoRole(role)}
            >
              {label}
            </Button>
          ))}
        </div>
        {user && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-xs"
            onClick={logout}
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;
