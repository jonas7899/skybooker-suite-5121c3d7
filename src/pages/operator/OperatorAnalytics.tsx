import React from 'react';
import { useOperatorAnalytics } from '@/hooks/useOperatorAnalytics';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Plane, 
  Banknote,
  Calendar,
  Loader2,
  AlertCircle,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(187, 70%, 45%)', 'hsl(35, 90%, 55%)', 'hsl(160, 60%, 45%)', 'hsl(280, 60%, 55%)', 'hsl(0, 70%, 55%)'];

const OperatorAnalytics: React.FC = () => {
  const { data, loading, error, period, setPeriod } = useOperatorAnalytics();
  const { t } = useLanguage();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const kpiCards = [
    { title: t('analytics.totalRevenue'), value: formatCurrency(data.totalRevenue), change: data.revenueChange, icon: <Banknote className="w-5 h-5" /> },
    { title: t('analytics.confirmedBookings'), value: data.confirmedBookings.toString(), change: data.bookingsChange, icon: <Plane className="w-5 h-5" /> },
    { title: t('analytics.avgValue'), value: formatCurrency(data.avgBookingValue), icon: <TrendingUp className="w-5 h-5" /> },
    { title: t('analytics.utilization'), value: `${data.utilizationRate}%`, icon: <Percent className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{t('analytics.title')}</h1>
          <p className="text-muted-foreground">{t('analytics.subtitle')}</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">{t('analytics.week')}</TabsTrigger>
            <TabsTrigger value="month">{t('analytics.month')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold font-display">{kpi.value}</p>
                  {kpi.change !== undefined && (
                    <div className={cn("flex items-center gap-1 mt-2 text-sm font-medium", kpi.change >= 0 ? "text-green-600" : "text-destructive")}>
                      {kpi.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{kpi.change >= 0 ? '+' : ''}{kpi.change}%</span>
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{kpi.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('analytics.revenueOverTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(187, 70%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(187, 70%, 45%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plane className="w-5 h-5 text-primary" />
              {t('analytics.bookingsByPackage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.packageStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.packageStats} dataKey="bookings" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={2}>
                    {data.packageStats.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">{t('analytics.noData')}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              {t('analytics.slotUtilization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.slotUtilization.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.slotUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="available" name={t('analytics.available')} fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="booked" name={t('analytics.booked')} fill="hsl(187, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">{t('analytics.noSlots')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t('analytics.summary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold font-display text-primary">{data.totalBookings}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('analytics.totalBookings')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold font-display text-green-600">{data.confirmedBookings}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('analytics.confirmed')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold font-display text-destructive">{data.cancelledBookings}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('analytics.cancelled')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold font-display text-accent">{data.packageStats.length}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('analytics.packages')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorAnalytics;
