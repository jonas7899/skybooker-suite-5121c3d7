import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OperatorStaff: React.FC = () => {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const canManageStaff = userRole?.role === 'operator_admin';

  if (!canManageStaff) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">
            {t('operator.staff.accessRestricted')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('operator.staff.noPermission')}
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
            {t('operator.staff.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('operator.staff.subtitle')}
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          {t('operator.staff.inviteStaff')}
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          {t('operator.staff.noStaff')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('operator.staff.noStaffDesc')}
        </p>
      </div>
    </div>
  );
};

export default OperatorStaff;
