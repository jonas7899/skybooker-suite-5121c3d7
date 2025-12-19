import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useSupportTier } from '@/hooks/useSupportTier';
import { useBookings } from '@/hooks/useBookings';
import { WeeklyCalendar } from '@/components/scheduling/WeeklyCalendar';
import { MonthlyCalendar } from '@/components/scheduling/MonthlyCalendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Grid3X3, Plane, Lock, LogIn } from 'lucide-react';
import { TimeSlot } from '@/types/scheduling';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';

const AvailabilityCalendar = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const { currentTier, canBook: hasSupport } = useSupportTier();
  const { bookings } = useBookings();
  const locale = language === 'hu' ? hu : enUS;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const isActive = profile?.status === 'active';

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
    navigate(`/foglalas?slot=${slot.id}`);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  // Filter only available slots for public view + user's own bookings
  const availableSlots = timeSlots.filter(slot => slot.status === 'available');
  const userBookingSlotIds = bookings?.map(b => b.time_slot_id) || [];
  const userBookedSlots = timeSlots.filter(slot => userBookingSlotIds.includes(slot.id));

  // Show login prompt if not authenticated or not active
  if (!authLoading && (!isAuthenticated || !isActive)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {language === 'hu' 
                ? 'Ez a tartalom csak bejelentkezett felhasználóknak érhető el'
                : 'This content is only available to logged in users'}
            </h1>
            <p className="text-muted-foreground">
              {!isAuthenticated 
                ? (language === 'hu' 
                    ? 'Kérjük, jelentkezz be a folytatáshoz.'
                    : 'Please log in to continue.')
                : (language === 'hu'
                    ? 'Fiókod még jóváhagyásra vár. Amint a stáb elfogadja, értesítünk.'
                    : 'Your account is pending approval. You will be notified once approved.')
              }
            </p>
            {!isAuthenticated && (
              <Button asChild variant="gradient">
                <Link to="/belepes">
                  <LogIn className="w-4 h-4 mr-2" />
                  {language === 'hu' ? 'Belépés' : 'Login'}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            {!hasSupport && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-block">
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  {language === 'hu'
                    ? 'Időpont foglaláshoz támogatói státusz szükséges. Látogass el a Támogatás oldalra!'
                    : 'Supporter status is required to book. Visit the Support page!'}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link to="/tamogatas">
                    {language === 'hu' ? 'Támogatás oldal' : 'Support Page'}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Show user's own bookings */}
          {userBookedSlots.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">
                {language === 'hu' ? 'Saját foglalásaid' : 'Your Bookings'}
              </h3>
              <div className="space-y-2">
                {userBookedSlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>
                      {format(new Date(slot.slot_date), 'yyyy. MMMM d.', { locale })} - {slot.start_time?.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              canBook={hasSupport ? canBook : () => false}
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
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
