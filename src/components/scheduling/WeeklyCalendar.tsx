import { useState, useEffect } from 'react';
import { TimeSlot } from '@/types/scheduling';
import { TimeSlotCard } from './TimeSlotCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeeklyCalendarProps {
  timeSlots: TimeSlot[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isAdmin?: boolean;
  canBook?: (slot: TimeSlot) => boolean;
  onEditSlot?: (slot: TimeSlot) => void;
  onDeleteSlot?: (slotId: string) => void;
  onBookSlot?: (slot: TimeSlot) => void;
}

export const WeeklyCalendar = ({
  timeSlots,
  currentDate,
  onDateChange,
  isAdmin = false,
  canBook,
  onEditSlot,
  onDeleteSlot,
  onBookSlot,
}: WeeklyCalendarProps) => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotsForDay = (day: Date) => {
    return timeSlots.filter(slot => isSameDay(new Date(slot.slot_date), day));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(subWeeks(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'yyyy. MMMM d.', { locale })} - {format(addDays(weekStart, 6), 'MMMM d.', { locale })}
        </h3>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(addWeeks(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const daySlots = getSlotsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[200px] rounded-lg border p-3 ${
                isToday ? 'border-primary bg-primary/5' : 'border-border/50 bg-card/30'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEEE', { locale })}
                </div>
                <div className={`text-xl font-bold ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-2">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {language === 'hu' ? 'Nincs időpont' : 'No slots'}
                  </p>
                ) : (
                  daySlots.map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      isAdmin={isAdmin}
                      canBook={canBook?.(slot)}
                      onEdit={onEditSlot}
                      onDelete={onDeleteSlot}
                      onBook={onBookSlot}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
