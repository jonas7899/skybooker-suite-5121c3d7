import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminSettings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('admin.settings.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6">{t('admin.settings.general')}</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">{t('admin.settings.platformName')}</Label>
            <Input id="platformName" defaultValue="SkyBook" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supportEmail">{t('admin.settings.supportEmail')}</Label>
            <Input id="supportEmail" type="email" defaultValue="support@skybook.com" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">{t('admin.settings.saveChanges')}</Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">{t('admin.settings.pricing')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('admin.settings.pricingDesc')}
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyPrice">{t('admin.settings.monthlyPrice')}</Label>
            <Input id="monthlyPrice" type="number" defaultValue="9999" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trialDays">{t('admin.settings.trialDays')}</Label>
            <Input id="trialDays" type="number" defaultValue="14" />
          </div>

          <div className="pt-4">
            <Button variant="gradient">{t('admin.settings.updatePricing')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
