import React, { useEffect, useState } from 'react';
import { Building2, Users, UserCog, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalOperators: number;
  totalUsers: number;
  monthlyRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalOperators: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  });
  const [recentSubscribers, setRecentSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch subscribers (operators table)
        const { data: subscribers, error: subError } = await supabase
          .from('operators')
          .select('*')
          .order('created_at', { ascending: false });

        if (subError) throw subError;

        // Fetch operators (staff - users with operator roles)
        const { data: operatorRoles, error: opError } = await supabase
          .from('user_roles')
          .select('id')
          .in('role', ['operator_admin', 'operator_staff']);

        if (opError) throw opError;

        // Fetch users (customers)
        const { data: userRoles, error: userError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'user');

        if (userError) throw userError;

        const activeSubscribers = subscribers?.filter(s => 
          s.subscription_status === 'active' || s.subscription_status === 'trial'
        ) || [];

        const monthlyRevenue = activeSubscribers.reduce((sum, s) => 
          sum + (s.subscription_price_huf || 0), 0
        );

        setStats({
          totalSubscribers: subscribers?.length || 0,
          activeSubscribers: activeSubscribers.length,
          totalOperators: operatorRoles?.length || 0,
          totalUsers: userRoles?.length || 0,
          monthlyRevenue,
        });

        setRecentSubscribers(subscribers?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      label: t('admin.dashboard.totalSubscribers'), 
      value: stats.totalSubscribers.toString(), 
      icon: <Building2 className="w-5 h-5" />, 
      color: 'bg-primary/10 text-primary',
      href: '/admin/subscribers'
    },
    { 
      label: t('admin.dashboard.totalOperators'), 
      value: stats.totalOperators.toString(), 
      icon: <UserCog className="w-5 h-5" />, 
      color: 'bg-accent/10 text-accent',
      href: '/admin/operators'
    },
    { 
      label: t('admin.dashboard.totalUsers'), 
      value: stats.totalUsers.toString(), 
      icon: <Users className="w-5 h-5" />, 
      color: 'bg-green-500/10 text-green-600',
      href: '/admin/users'
    },
    { 
      label: t('admin.dashboard.monthlyRevenue'), 
      value: `${stats.monthlyRevenue.toLocaleString(language === 'hu' ? 'hu-HU' : 'en-US')} Ft`, 
      icon: <TrendingUp className="w-5 h-5" />, 
      color: 'bg-purple-500/10 text-purple-600',
      href: '/admin/analytics'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.href}
            className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
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
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.recentSubscribers')}</h2>
          {recentSubscribers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('admin.dashboard.noSubscribers')}
            </p>
          ) : (
            <div className="space-y-3">
              {recentSubscribers.map((subscriber) => (
                <Link 
                  key={subscriber.id} 
                  to={`/admin/subscribers/${subscriber.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{subscriber.name}</p>
                    <p className="text-sm text-muted-foreground">{subscriber.slug}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    subscriber.subscription_status === 'active' 
                      ? 'bg-green-500/10 text-green-600'
                      : subscriber.subscription_status === 'trial'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-red-500/10 text-red-600'
                  }`}>
                    {subscriber.subscription_status}
                  </span>
                </Link>
              ))}
            </div>
          )}
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
