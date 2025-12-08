import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Building2, CreditCard } from 'lucide-react';

const OperatorSettings: React.FC = () => {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const canManageSettings = userRole?.role === 'operator_admin';

  if (!canManageSettings) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">
            {t('operator.settings.accessRestricted')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('operator.settings.noPermission')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('operator.settings.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('operator.settings.subtitle')}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          {t('operator.settings.companyInfo')}
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">{t('operator.settings.companyName')}</Label>
            <Input id="companyName" placeholder={t('operator.settings.companyNamePlaceholder')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t('operator.settings.contactEmail')}</Label>
            <Input id="contactEmail" type="email" placeholder="contact@company.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('operator.settings.phone')}</Label>
            <Input id="phone" type="tel" placeholder="+36 1 234 5678" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">{t('operator.settings.saveChanges')}</Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          {t('operator.settings.subscription')}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('operator.settings.subscriptionDesc')}
        </p>
        
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{t('operator.settings.professionalPlan')}</p>
              <p className="text-sm text-muted-foreground">9,999 HUF/{t('analytics.month').toLowerCase()}</p>
            </div>
            <Button variant="outline" size="sm">{t('operator.settings.manage')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorSettings;
