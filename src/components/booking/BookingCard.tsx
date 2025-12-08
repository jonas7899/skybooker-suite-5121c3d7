import { Booking } from '@/types/booking';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { Calendar, Clock, Users, XCircle } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

const BookingCard = ({ booking, onCancel, showActions = true }: BookingCardProps) => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const statusLabels: Record<string, { hu: string; en: string }> = {
    pending: { hu: 'Függőben', en: 'Pending' },
    confirmed: { hu: 'Megerősítve', en: 'Confirmed' },
    cancelled: { hu: 'Lemondva', en: 'Cancelled' },
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {booking.flight_package?.name || 'Flight Package'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {booking.flight_package?.short_description}
                </p>
              </div>
              <Badge className={statusColors[booking.status]}>
                {statusLabels[booking.status][language === 'hu' ? 'hu' : 'en']}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm">
              {booking.time_slot && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.time_slot.slot_date), 'PPP', { locale })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {booking.time_slot.start_time} ({booking.time_slot.duration_minutes} {language === 'hu' ? 'perc' : 'min'})
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {booking.passenger_count} {language === 'hu' ? 'utas' : 'passenger(s)'}
                </span>
              </div>
            </div>

            {showActions && booking.status === 'pending' && onCancel && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {language === 'hu' ? 'Lemondás' : 'Cancel'}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-muted/50 p-4 sm:p-6 sm:w-48 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">
                {language === 'hu' ? 'Összesen' : 'Total'}
              </p>
              <p className="text-2xl font-bold">
                {booking.total_price_huf.toLocaleString()} Ft
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(booking.created_at), 'PP', { locale })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
