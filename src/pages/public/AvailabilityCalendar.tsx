import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { WeeklyCalendar } from '@/components/scheduling/WeeklyCalendar';
import { MonthlyCalendar } from '@/components/scheduling/MonthlyCalendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Grid3X3, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { TimeSlot } from '@/types/scheduling';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';

const AvailabilityCalendar = () => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const {
    timeSlots,
    loading,
    fetchWeekSlots,
    fetchMonthSlots,
    canBook,
  } = useTimeSlots();

  useEffect(() => {
    if (viewMode === 'week') {
      fetchWeekSlots(currentDate);
    } else {
      fetchMonthSlots(currentDate);
    }
  }, [currentDate, viewMode]);

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const confirmBooking = () => {
    // In real app, this would navigate to booking flow or open booking form
    toast.success(
      language === 'hu'
        ? 'Foglalás folyamatban... (Bejelentkezés szükséges)'
        : 'Booking in progress... (Login required)'
    );
    setSelectedSlot(null);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  // Filter only available slots for public view
  const availableSlots = timeSlots.filter(slot => slot.status === 'available');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {language === 'hu' ? 'Elérhető időpontok' : 'Available Time Slots'}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'hu'
                ? 'Válassz egy szabad időpontot a repüléshez. A foglaláshoz legalább 24 órával a repülés előtt kell jelentkezni.'
                : 'Choose an available time slot for your flight. Bookings must be made at least 24 hours in advance.'}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="week" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {language === 'hu' ? 'Heti nézet' : 'Week View'}
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  {language === 'hu' ? 'Havi nézet' : 'Month View'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12 bg-card/50 rounded-lg border border-border/50">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'hu' ? 'Nincs elérhető időpont' : 'No Available Slots'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'hu'
                  ? 'Jelenleg nincs szabad időpont ebben az időszakban.'
                  : 'There are no available time slots in this period.'}
              </p>
            </div>
          ) : viewMode === 'week' ? (
            <WeeklyCalendar
              timeSlots={availableSlots}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              isAdmin={false}
              canBook={canBook}
              onBookSlot={handleBookSlot}
            />
          ) : (
            <MonthlyCalendar
              timeSlots={availableSlots}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDayClick={handleDayClick}
            />
          )}

          <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === 'hu' ? 'Foglalás megerősítése' : 'Confirm Booking'}
                </DialogTitle>
                <DialogDescription>
                  {selectedSlot && (
                    <div className="space-y-2 mt-4">
                      <p>
                        <strong>{language === 'hu' ? 'Dátum:' : 'Date:'}</strong>{' '}
                        {format(new Date(selectedSlot.slot_date), 'PPP', { locale })}
                      </p>
                      <p>
                        <strong>{language === 'hu' ? 'Időpont:' : 'Time:'}</strong>{' '}
                        {selectedSlot.start_time}
                      </p>
                      <p>
                        <strong>{language === 'hu' ? 'Időtartam:' : 'Duration:'}</strong>{' '}
                        {selectedSlot.duration_minutes} {language === 'hu' ? 'perc' : 'minutes'}
                      </p>
                      {selectedSlot.flight_package && (
                        <p>
                          <strong>{language === 'hu' ? 'Csomag:' : 'Package:'}</strong>{' '}
                          {selectedSlot.flight_package.name}
                        </p>
                      )}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                  {language === 'hu' ? 'Mégse' : 'Cancel'}
                </Button>
                <Button onClick={confirmBooking}>
                  {language === 'hu' ? 'Foglalás' : 'Book Now'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
