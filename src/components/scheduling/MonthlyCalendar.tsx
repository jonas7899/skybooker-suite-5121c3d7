import { TimeSlot } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface MonthlyCalendarProps {
  timeSlots: TimeSlot[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

export const MonthlyCalendar = ({
  timeSlots,
  currentDate,
  onDateChange,
  onDayClick,
}: MonthlyCalendarProps) => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getSlotsForDay = (date: Date) => {
    return timeSlots.filter(slot => isSameDay(new Date(slot.slot_date), date));
  };

  const getAvailableCount = (date: Date) => {
    return getSlotsForDay(date).filter(s => s.status === 'available').length;
  };

  const weekDayNames = language === 'hu'
    ? ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-xl font-semibold">
          {format(currentDate, 'yyyy. MMMM', { locale })}
        </h3>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {name}
          </div>
        ))}

        {days.map((date) => {
          const isToday = isSameDay(date, new Date());
          const isCurrentMonth = isSameMonth(date, currentDate);
          const availableCount = getAvailableCount(date);
          const hasSlots = getSlotsForDay(date).length > 0;

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick?.(date)}
              className={`
                aspect-square p-1 rounded-lg border transition-colors relative
                ${isCurrentMonth ? 'bg-card/50' : 'bg-background/30 opacity-50'}
                ${isToday ? 'border-primary ring-1 ring-primary' : 'border-border/30'}
                ${hasSlots ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'}
              `}
            >
              <div className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(date, 'd')}
              </div>
              {availableCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute bottom-1 right-1 text-[10px] px-1 py-0 bg-green-500/20 text-green-400"
                >
                  {availableCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
