import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { WeeklyCalendar } from '@/components/scheduling/WeeklyCalendar';
import { MonthlyCalendar } from '@/components/scheduling/MonthlyCalendar';
import { CreateTimeSlotDialog } from '@/components/scheduling/CreateTimeSlotDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar as CalendarIcon, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import { TimeSlot, FlightPackage } from '@/types/scheduling';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const OperatorCalendar = () => {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [flightPackages, setFlightPackages] = useState<FlightPackage[]>([]);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  // Get operator ID from user role
  const operatorId = userRole?.operator_id || 'demo-operator';

  const {
    timeSlots,
    loading,
    fetchWeekSlots,
    fetchMonthSlots,
    createTimeSlot,
    deleteTimeSlot,
  } = useTimeSlots(operatorId);

  useEffect(() => {
    if (viewMode === 'week') {
      fetchWeekSlots(currentDate);
    } else {
      fetchMonthSlots(currentDate);
    }
  }, [currentDate, viewMode]);

  useEffect(() => {
    // Fetch flight packages
    const fetchPackages = async () => {
      const { data } = await supabase
        .from('flight_packages')
        .select('*')
        .eq('operator_id', operatorId)
        .eq('is_active', true);
      
      if (data) {
        setFlightPackages(data as FlightPackage[]);
      }
    };
    fetchPackages();
  }, [operatorId]);

  const handleCreateSlot = async (data: {
    slot_date: string;
    start_time: string;
    duration_minutes: number;
    max_passengers: number;
    flight_package_id?: string;
  }) => {
    try {
      await createTimeSlot({
        ...data,
        operator_id: operatorId,
      });
      toast.success(t('operator.calendar.slotCreated'));
      if (viewMode === 'week') {
        fetchWeekSlots(currentDate);
      } else {
        fetchMonthSlots(currentDate);
      }
    } catch (error) {
      toast.error(t('error.generic'));
    }
  };

  const handleDeleteSlot = async () => {
    if (!deleteSlotId) return;
    
    try {
      await deleteTimeSlot(deleteSlotId);
      toast.success(t('operator.calendar.slotDeleted'));
      setDeleteSlotId(null);
      if (viewMode === 'week') {
        fetchWeekSlots(currentDate);
      } else {
        fetchMonthSlots(currentDate);
      }
    } catch (error) {
      toast.error(t('error.generic'));
    }
  };

  const handleEditSlot = (slot: TimeSlot) => {
    console.log('Edit slot:', slot);
    toast.info(t('operator.calendar.editSoon'));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t('operator.calendar.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('operator.calendar.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="week" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('operator.calendar.week')}
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                {t('operator.calendar.month')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('operator.calendar.newSlot')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'week' ? (
        <WeeklyCalendar
          timeSlots={timeSlots}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          isAdmin={true}
          onEditSlot={handleEditSlot}
          onDeleteSlot={(id) => setDeleteSlotId(id)}
        />
      ) : (
        <MonthlyCalendar
          timeSlots={timeSlots}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDayClick={handleDayClick}
        />
      )}

      <CreateTimeSlotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSlot}
        flightPackages={flightPackages}
        selectedDate={selectedDate}
      />

      <AlertDialog open={!!deleteSlotId} onOpenChange={() => setDeleteSlotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('operator.calendar.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('operator.calendar.deleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSlot}>
              {t('analytics.cancelled')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OperatorCalendar;
