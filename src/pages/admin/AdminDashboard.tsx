import React from 'react';
import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { label: t('admin.dashboard.totalOperators'), value: '0', icon: <Building2 className="w-5 h-5" />, color: 'bg-primary/10 text-primary' },
    { label: t('admin.dashboard.activeUsers'), value: '0', icon: <Users className="w-5 h-5" />, color: 'bg-accent/10 text-accent' },
    { label: t('admin.dashboard.activeSubscriptions'), value: '0', icon: <CreditCard className="w-5 h-5" />, color: 'bg-green-500/10 text-green-600' },
    { label: t('admin.dashboard.monthlyRevenue'), value: '0 HUF', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-6 border border-border shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.recentOperators')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('admin.dashboard.noOperators')}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.recentActivity')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('admin.dashboard.noActivity')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
