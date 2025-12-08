import { TimeSlot } from '@/types/scheduling';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Plane, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimeSlotCardProps {
  slot: TimeSlot;
  isAdmin?: boolean;
  canBook?: boolean;
  onEdit?: (slot: TimeSlot) => void;
  onDelete?: (slotId: string) => void;
  onBook?: (slot: TimeSlot) => void;
}

export const TimeSlotCard = ({
  slot,
  isAdmin = false,
  canBook = false,
  onEdit,
  onDelete,
  onBook,
}: TimeSlotCardProps) => {
  const { language } = useLanguage();

  const statusColors: Record<string, string> = {
    available: 'bg-green-500/20 text-green-400 border-green-500/30',
    booked: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    closed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusLabels = {
    available: language === 'hu' ? 'Elérhető' : 'Available',
    booked: language === 'hu' ? 'Foglalt' : 'Booked',
    closed: language === 'hu' ? 'Lezárva' : 'Closed',
  };

  const formattedTime = format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm');

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-semibold text-lg">{formattedTime}</span>
        </div>
        <Badge className={statusColors[slot.status]}>
          {statusLabels[slot.status]}
        </Badge>
      </div>

      {slot.flight_package && (
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Plane className="h-4 w-4" />
          <span className="text-sm">{slot.flight_package.name}</span>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span>{slot.duration_minutes} {language === 'hu' ? 'perc' : 'min'}</span>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>
            {slot.current_passengers}/{slot.max_passengers}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {isAdmin ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(slot)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              {language === 'hu' ? 'Szerkesztés' : 'Edit'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(slot.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          canBook && (
            <Button
              onClick={() => onBook?.(slot)}
              className="w-full"
              size="sm"
            >
              {language === 'hu' ? 'Foglalás' : 'Book Now'}
            </Button>
          )
        )}
      </div>
    </div>
  );
};
