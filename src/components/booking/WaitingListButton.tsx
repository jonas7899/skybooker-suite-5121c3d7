import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaitingList } from '@/hooks/useWaitingList';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Loader2, Check, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WaitingListButtonProps {
  timeSlotId: string;
  flightPackageId: string;
  slotDate: string;
  slotTime: string;
}

export const WaitingListButton: React.FC<WaitingListButtonProps> = ({ timeSlotId, flightPackageId, slotDate, slotTime }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { joinWaitingList } = useWaitingList();
  const [open, setOpen] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: t('auth.required'), description: t('waitingList.loginRequired'), variant: 'destructive' });
      navigate('/belepes?redirect=/idopontok');
      return;
    }
    setLoading(true);
    try {
      await joinWaitingList(timeSlotId, flightPackageId, passengerCount);
      setJoined(true);
      toast({ title: t('waitingList.joined'), description: t('waitingList.joinedDesc') });
      setOpen(false);
    } catch (error) {
      toast({ title: t('error.title'), description: error instanceof Error ? error.message : t('error.generic'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (joined) return <Button variant="outline" size="sm" disabled className="gap-2"><Check className="w-4 h-4 text-green-500" />{t('waitingList.onList')}</Button>;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2"><Bell className="w-4 h-4" />{t('waitingList.join')}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{t('waitingList.title')}</DialogTitle>
            <DialogDescription>{t('waitingList.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg"><p className="font-medium">{slotDate}</p><p className="text-sm text-muted-foreground">{slotTime}</p></div>
            <div className="space-y-2">
              <Label htmlFor="passengerCount">{t('waitingList.passengers')}</Label>
              <Input id="passengerCount" type="number" min={1} max={4} value={passengerCount} onChange={(e) => setPassengerCount(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleJoin} disabled={loading} className="gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}{t('waitingList.subscribe')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
