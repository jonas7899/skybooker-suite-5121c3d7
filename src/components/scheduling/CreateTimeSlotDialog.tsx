import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FlightPackage } from '@/types/scheduling';

interface CreateTimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    slot_date: string;
    start_time: string;
    duration_minutes: number;
    max_passengers: number;
    flight_package_id?: string;
  }) => Promise<void>;
  flightPackages: FlightPackage[];
  selectedDate?: Date;
}

export const CreateTimeSlotDialog = ({
  open,
  onOpenChange,
  onSubmit,
  flightPackages,
  selectedDate,
}: CreateTimeSlotDialogProps) => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;

  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [maxPassengers, setMaxPassengers] = useState(1);
  const [packageId, setPackageId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date) return;

    setLoading(true);
    try {
      await onSubmit({
        slot_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        duration_minutes: duration,
        max_passengers: maxPassengers,
        flight_package_id: packageId || undefined,
      });
      onOpenChange(false);
      // Reset form
      setStartTime('09:00');
      setDuration(30);
      setMaxPassengers(1);
      setPackageId('');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [];
  for (let h = 6; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {language === 'hu' ? 'Új időpont létrehozása' : 'Create Time Slot'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{language === 'hu' ? 'Dátum' : 'Date'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale }) : (language === 'hu' ? 'Válassz dátumot' : 'Pick a date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{language === 'hu' ? 'Kezdési idő' : 'Start Time'}</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === 'hu' ? 'Időtartam (perc)' : 'Duration (minutes)'}</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 {language === 'hu' ? 'perc' : 'min'}</SelectItem>
                <SelectItem value="30">30 {language === 'hu' ? 'perc' : 'min'}</SelectItem>
                <SelectItem value="45">45 {language === 'hu' ? 'perc' : 'min'}</SelectItem>
                <SelectItem value="60">60 {language === 'hu' ? 'perc' : 'min'}</SelectItem>
                <SelectItem value="90">90 {language === 'hu' ? 'perc' : 'min'}</SelectItem>
                <SelectItem value="120">120 {language === 'hu' ? 'perc' : 'min'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === 'hu' ? 'Max. utasok' : 'Max Passengers'}</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={maxPassengers}
              onChange={(e) => setMaxPassengers(parseInt(e.target.value) || 1)}
            />
          </div>

          {flightPackages.length > 0 && (
            <div className="space-y-2">
              <Label>{language === 'hu' ? 'Repülési csomag (opcionális)' : 'Flight Package (optional)'}</Label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'hu' ? 'Válassz csomagot...' : 'Select package...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    {language === 'hu' ? 'Nincs csomag' : 'No package'}
                  </SelectItem>
                  {flightPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'hu' ? 'Mégse' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={!date || loading}>
            {loading
              ? (language === 'hu' ? 'Mentés...' : 'Saving...')
              : (language === 'hu' ? 'Létrehozás' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
