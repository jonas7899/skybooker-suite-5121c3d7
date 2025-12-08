import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

interface PackageStats {
  name: string;
  bookings: number;
  revenue: number;
}

interface DailyStats {
  date: string;
  bookings: number;
  revenue: number;
}

interface SlotUtilization {
  date: string;
  available: number;
  booked: number;
  utilizationRate: number;
}

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  avgBookingValue: number;
  utilizationRate: number;
  revenueChange: number;
  bookingsChange: number;
  packageStats: PackageStats[];
  dailyStats: DailyStats[];
  slotUtilization: SlotUtilization[];
}

export const useOperatorAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const currentStart = period === 'month' ? startOfMonth(now) : startOfWeek(now, { weekStartsOn: 1 });
      const currentEnd = period === 'month' ? endOfMonth(now) : endOfWeek(now, { weekStartsOn: 1 });
      const previousStart = period === 'month' ? startOfMonth(subMonths(now, 1)) : startOfWeek(subMonths(now, 1), { weekStartsOn: 1 });
      const previousEnd = period === 'month' ? endOfMonth(subMonths(now, 1)) : endOfWeek(subMonths(now, 1), { weekStartsOn: 1 });

      // Fetch current period bookings
      const { data: currentBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          total_price_huf,
          created_at,
          flight_package:flight_packages(id, name)
        `)
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      if (bookingsError) throw bookingsError;

      // Fetch previous period bookings for comparison
      const { data: previousBookings, error: prevError } = await supabase
        .from('bookings')
        .select('id, total_price_huf, status')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      if (prevError) throw prevError;

      // Fetch time slots for utilization
      const { data: timeSlots, error: slotsError } = await supabase
        .from('flight_time_slots')
        .select('id, slot_date, status, max_passengers, current_passengers')
        .gte('slot_date', format(currentStart, 'yyyy-MM-dd'))
        .lte('slot_date', format(currentEnd, 'yyyy-MM-dd'));

      if (slotsError) throw slotsError;

      // Calculate stats
      const confirmedBookings = currentBookings?.filter(b => b.status === 'confirmed') || [];
      const cancelledBookings = currentBookings?.filter(b => b.status === 'cancelled') || [];
      const prevConfirmed = previousBookings?.filter(b => b.status === 'confirmed') || [];

      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_price_huf || 0), 0);
      const prevRevenue = prevConfirmed.reduce((sum, b) => sum + (b.total_price_huf || 0), 0);

      // Package stats
      const packageMap = new Map<string, { name: string; bookings: number; revenue: number }>();
      confirmedBookings.forEach(b => {
        const pkgName = (b.flight_package as any)?.name || 'Ismeretlen';
        const existing = packageMap.get(pkgName) || { name: pkgName, bookings: 0, revenue: 0 };
        existing.bookings += 1;
        existing.revenue += b.total_price_huf || 0;
        packageMap.set(pkgName, existing);
      });

      // Daily stats
      const days = eachDayOfInterval({ start: currentStart, end: currentEnd });
      const dailyStats = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayBookings = confirmedBookings.filter(b => 
          format(new Date(b.created_at), 'yyyy-MM-dd') === dayStr
        );
        return {
          date: format(day, 'MM.dd'),
          bookings: dayBookings.length,
          revenue: dayBookings.reduce((sum, b) => sum + (b.total_price_huf || 0), 0),
        };
      });

      // Slot utilization
      const slotsByDate = new Map<string, { available: number; booked: number }>();
      (timeSlots || []).forEach(slot => {
        const dateStr = format(new Date(slot.slot_date), 'MM.dd');
        const existing = slotsByDate.get(dateStr) || { available: 0, booked: 0 };
        if (slot.status === 'available') {
          existing.available += 1;
        } else if (slot.status === 'booked') {
          existing.booked += 1;
        }
        slotsByDate.set(dateStr, existing);
      });

      const slotUtilization = Array.from(slotsByDate.entries()).map(([date, stats]) => ({
        date,
        available: stats.available,
        booked: stats.booked,
        utilizationRate: stats.available + stats.booked > 0 
          ? Math.round((stats.booked / (stats.available + stats.booked)) * 100) 
          : 0,
      }));

      // Calculate changes
      const revenueChange = prevRevenue > 0 
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) 
        : totalRevenue > 0 ? 100 : 0;
      const bookingsChange = prevConfirmed.length > 0 
        ? Math.round(((confirmedBookings.length - prevConfirmed.length) / prevConfirmed.length) * 100) 
        : confirmedBookings.length > 0 ? 100 : 0;

      const totalSlots = (timeSlots || []).length;
      const bookedSlots = (timeSlots || []).filter(s => s.status === 'booked').length;

      setData({
        totalRevenue,
        totalBookings: currentBookings?.length || 0,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        avgBookingValue: confirmedBookings.length > 0 ? Math.round(totalRevenue / confirmedBookings.length) : 0,
        utilizationRate: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0,
        revenueChange,
        bookingsChange,
        packageStats: Array.from(packageMap.values()),
        dailyStats,
        slotUtilization,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba az analitika betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return { data, loading, error, period, setPeriod, refetch: fetchAnalytics };
};
