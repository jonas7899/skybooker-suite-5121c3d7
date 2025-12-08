import React from 'react';
import { CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminSubscriptions: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('admin.subscriptions.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.subscriptions.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('admin.subscriptions.active')}</p>
          <p className="text-2xl font-display font-bold">0</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('admin.subscriptions.trial')}</p>
          <p className="text-2xl font-display font-bold">0</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('admin.subscriptions.expired')}</p>
          <p className="text-2xl font-display font-bold">0</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          {t('admin.subscriptions.empty.title')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('admin.subscriptions.empty.description')}
        </p>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
