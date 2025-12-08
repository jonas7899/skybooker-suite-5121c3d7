import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import BookingCard from '@/components/booking/BookingCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, Plus } from 'lucide-react';

const UserBookingsPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { bookings, loading, fetchUserBookings, cancelBooking } = useBookings();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/belepes');
      return;
    }
    fetchUserBookings();
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      toast.success(
        language === 'hu' 
          ? 'Foglalás sikeresen lemondva' 
          : 'Booking cancelled successfully'
      );
      fetchUserBookings();
    } catch (err) {
      toast.error(
        language === 'hu' 
          ? 'Hiba történt a lemondás során' 
          : 'Error cancelling booking'
      );
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            {language === 'hu' ? 'Foglalásaim' : 'My Bookings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hu' 
              ? 'Tekintsd meg és kezeld foglalásaidat' 
              : 'View and manage your flight bookings'}
          </p>
        </div>
        <Button onClick={() => navigate('/foglalas')}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'hu' ? 'Új foglalás' : 'New Booking'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {language === 'hu' ? 'Összes' : 'All'}
          </TabsTrigger>
          <TabsTrigger value="pending">
            {language === 'hu' ? 'Függőben' : 'Pending'}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            {language === 'hu' ? 'Megerősített' : 'Confirmed'}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            {language === 'hu' ? 'Lemondott' : 'Cancelled'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-semibold mb-2">
                {language === 'hu' ? 'Nincs foglalás' : 'No bookings yet'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {language === 'hu'
                  ? 'A foglalási előzményeid itt fognak megjelenni.'
                  : 'Your booking history will appear here once you make your first reservation.'}
              </p>
              <Button onClick={() => navigate('/foglalas')}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'hu' ? 'Foglalás' : 'Book Now'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserBookingsPage;
