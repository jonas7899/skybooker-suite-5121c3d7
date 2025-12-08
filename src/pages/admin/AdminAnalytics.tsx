import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminAnalytics: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('admin.analytics.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.analytics.subtitle')}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          {t('admin.analytics.comingSoon')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('admin.analytics.comingSoonDesc')}
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
