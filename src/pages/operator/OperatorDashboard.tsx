import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { 
  Plane, 
  Calendar, 
  Users, 
  TrendingUp, 
  Heart,
  Package,
  Clock,
  ArrowRight,
  CalendarDays
} from 'lucide-react';

interface DashboardStats {
  activePackages: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeSupports: number;
  totalSupports: number;
  totalRevenue: number;
  upcomingSlots: number;
}

interface RecentBooking {
  id: string;
  status: string;
  created_at: string;
  total_price_huf: number;
  passenger_count: number;
  flight_package?: { name: string };
  time_slot?: { slot_date: string; start_time: string };
}

interface UpcomingSlot {
  id: string;
  slot_date: string;
  start_time: string;
  current_passengers: number;
  max_passengers: number;
  flight_package?: { name: string };
}

const OperatorDashboard: React.FC = () => {
  const { profile, userRole } = useAuth();
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;
  const operatorId = userRole?.operator_id;

  const [stats, setStats] = useState<DashboardStats>({
    activePackages: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    activeSupports: 0,
    totalSupports: 0,
    totalRevenue: 0,
    upcomingSlots: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [upcomingSlots, setUpcomingSlots] = useState<UpcomingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (operatorId) {
      fetchDashboardData();
    }
  }, [operatorId]);

  const fetchDashboardData = async () => {
    if (!operatorId) return;

    try {
      // Fetch active packages count
      const { count: packagesCount } = await supabase
        .from('flight_packages')
        .select('*', { count: 'exact', head: true })
        .eq('operator_id', operatorId)
        .eq('is_active', true);

      // Fetch bookings stats
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('status, total_price_huf, time_slot_id')
        .in('time_slot_id', 
          (await supabase
            .from('flight_time_slots')
            .select('id')
            .eq('operator_id', operatorId)
          ).data?.map(s => s.id) || []
        );

      const totalBookings = bookingsData?.length || 0;
      const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0;
      const confirmedBookings = bookingsData?.filter(b => b.status === 'confirmed').length || 0;
      const totalRevenue = bookingsData
        ?.filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total_price_huf || 0), 0) || 0;

      // Fetch supports stats
      const { data: supportsData } = await supabase
        .from('user_supports')
        .select('booking_used')
        .eq('operator_id', operatorId);

      const totalSupports = supportsData?.length || 0;
      const activeSupports = supportsData?.filter(s => !s.booking_used).length || 0;

      // Fetch upcoming slots count
      const today = new Date().toISOString().split('T')[0];
      const { count: slotsCount } = await supabase
        .from('flight_time_slots')
        .select('*', { count: 'exact', head: true })
        .eq('operator_id', operatorId)
        .eq('status', 'available')
        .gte('slot_date', today);

      // Fetch recent bookings
      const { data: recentBookingsData } = await supabase
        .from('bookings')
        .select(`
          id, status, created_at, total_price_huf, passenger_count,
          flight_package:flight_packages(name),
          time_slot:flight_time_slots(slot_date, start_time, operator_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Filter bookings by operator
      const operatorBookings = recentBookingsData?.filter(
        b => (b.time_slot as any)?.operator_id === operatorId
      ) || [];

      // Fetch upcoming slots
      const { data: upcomingSlotsData } = await supabase
        .from('flight_time_slots')
        .select(`
          id, slot_date, start_time, current_passengers, max_passengers,
          flight_package:flight_packages(name)
        `)
        .eq('operator_id', operatorId)
        .eq('status', 'available')
        .gte('slot_date', today)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      setStats({
        activePackages: packagesCount || 0,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        activeSupports,
        totalSupports,
        totalRevenue,
        upcomingSlots: slotsCount || 0,
      });

      setRecentBookings(operatorBookings as RecentBooking[]);
      setUpcomingSlots(upcomingSlotsData as UpcomingSlot[] || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: language === 'hu' ? 'Függőben' : 'Pending' },
      confirmed: { variant: 'default', label: language === 'hu' ? 'Megerősítve' : 'Confirmed' },
      cancelled: { variant: 'destructive', label: language === 'hu' ? 'Lemondva' : 'Cancelled' },
    };
    const { variant, label } = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const statCards = [
    { 
      label: language === 'hu' ? 'Aktív csomagok' : 'Active Packages', 
      value: stats.activePackages.toString(), 
      icon: <Package className="w-5 h-5" />,
      href: '/operator/packages',
      color: 'text-blue-500 bg-blue-500/10'
    },
    { 
      label: language === 'hu' ? 'Összes foglalás' : 'Total Bookings', 
      value: stats.totalBookings.toString(),
      subValue: stats.pendingBookings > 0 
        ? `${stats.pendingBookings} ${language === 'hu' ? 'függőben' : 'pending'}`
        : undefined,
      icon: <Calendar className="w-5 h-5" />,
      href: '/operator/bookings',
      color: 'text-green-500 bg-green-500/10'
    },
    { 
      label: language === 'hu' ? 'Aktív támogatók' : 'Active Supporters', 
      value: stats.activeSupports.toString(),
      subValue: `${stats.totalSupports} ${language === 'hu' ? 'összesen' : 'total'}`,
      icon: <Heart className="w-5 h-5" />,
      href: '/operator/supporters',
      color: 'text-pink-500 bg-pink-500/10'
    },
    { 
      label: language === 'hu' ? 'Bevétel' : 'Revenue', 
      value: `${stats.totalRevenue.toLocaleString()} Ft`,
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/operator/analytics',
      color: 'text-amber-500 bg-amber-500/10'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {language === 'hu' ? 'Irányítópult' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'hu' ? 'Üdvözöljük' : 'Welcome back'}, {profile?.full_name || 'Operator'}
          {userRole?.role === 'operator_admin' && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              Admin
            </span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              {language === 'hu' ? 'Legutóbbi foglalások' : 'Recent Bookings'}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/operator/bookings">
                {language === 'hu' ? 'Összes' : 'View all'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                {language === 'hu' ? 'Még nincs foglalás' : 'No bookings yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">
                        {(booking.flight_package as any)?.name || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(booking.created_at), 'MMM d, HH:mm', { locale })}
                        <span>•</span>
                        <Users className="w-3 h-3" />
                        {booking.passenger_count} {language === 'hu' ? 'fő' : 'pax'}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {booking.total_price_huf.toLocaleString()} Ft
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Slots */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              {language === 'hu' ? 'Közelgő időpontok' : 'Upcoming Slots'}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/operator/calendar">
                {language === 'hu' ? 'Naptár' : 'Calendar'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingSlots.length === 0 ? (
              <div className="text-center py-4">
                <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  {language === 'hu' ? 'Nincs közelgő időpont' : 'No upcoming slots'}
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/operator/calendar">
                    {language === 'hu' ? 'Időpont létrehozása' : 'Create slot'}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">
                        {(slot.flight_package as any)?.name || (language === 'hu' ? 'Általános' : 'General')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(slot.slot_date), 'MMM d', { locale })}
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        {slot.start_time?.slice(0, 5)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {slot.current_passengers}/{slot.max_passengers} {language === 'hu' ? 'fő' : 'pax'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                {language === 'hu' ? 'Gyors összefoglaló' : 'Quick Summary'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'hu' 
                  ? `${stats.upcomingSlots} szabad időpont • ${stats.confirmedBookings} megerősített foglalás`
                  : `${stats.upcomingSlots} available slots • ${stats.confirmedBookings} confirmed bookings`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/operator/calendar">
                  <Calendar className="w-4 h-4 mr-2" />
                  {language === 'hu' ? 'Naptár' : 'Calendar'}
                </Link>
              </Button>
              <Button variant="gradient" size="sm" asChild>
                <Link to="/operator/packages">
                  <Package className="w-4 h-4 mr-2" />
                  {language === 'hu' ? 'Csomagok' : 'Packages'}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorDashboard;