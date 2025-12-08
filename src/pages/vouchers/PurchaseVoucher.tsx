import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useVouchers } from '@/hooks/useVouchers';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Gift, Plane, Clock, ArrowLeft, Check, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlightPackage { id: string; name: string; short_description?: string; duration_minutes: number; base_price_huf: number; operator_id: string; }
type Step = 'package' | 'details' | 'confirm';

const PurchaseVoucher: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { createVoucher } = useVouchers();
  const [step, setStep] = useState<Step>('package');
  const [packages, setPackages] = useState<FlightPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<FlightPackage | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (!user) { toast({ title: t('auth.required'), description: t('voucher.loginRequired'), variant: 'destructive' }); navigate('/belepes?redirect=/utalvany'); }
    };
    const fetchPackages = async () => {
      const { data } = await supabase.from('flight_packages').select('id, name, short_description, duration_minutes, base_price_huf, operator_id').eq('is_active', true);
      if (data) setPackages(data);
      setLoading(false);
    };
    checkAuth();
    fetchPackages();
  }, [navigate, t]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(v);

  const handleSubmit = async () => {
    if (!selectedPackage || !recipientName.trim()) return;
    setSubmitting(true);
    try {
      await createVoucher({ flight_package_id: selectedPackage.id, recipient_name: recipientName.trim(), recipient_email: recipientEmail.trim() || undefined, personal_message: personalMessage.trim() || undefined }, selectedPackage.operator_id, selectedPackage.base_price_huf);
      toast({ title: t('voucher.created'), description: t('voucher.createdDesc') });
      navigate('/dashboard/vouchers');
    } catch (error) {
      toast({ title: t('error.title'), description: error instanceof Error ? error.message : t('error.generic'), variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const steps = [{ key: 'package', label: t('voucher.step.package') }, { key: 'details', label: t('voucher.step.details') }, { key: 'confirm', label: t('voucher.step.confirm') }];
  const currentStepIndex = steps.findIndex(s => s.key === step);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}</Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center"><Gift className="w-7 h-7 text-primary-foreground" /></div>
            <div><h1 className="text-2xl md:text-3xl font-display font-bold">{t('voucher.purchase.title')}</h1><p className="text-muted-foreground">{t('voucher.purchase.subtitle')}</p></div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium", i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {i < currentStepIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("hidden sm:inline text-sm font-medium", i <= currentStepIndex ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        {step === 'package' && (
          <div className="space-y-4">
            {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : packages.length === 0 ? (
              <Card className="p-8 text-center"><Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">{t('voucher.noPackages')}</p></Card>
            ) : packages.map((pkg) => (
              <Card key={pkg.id} className={cn("cursor-pointer transition-all hover:shadow-md", selectedPackage?.id === pkg.id && "ring-2 ring-primary")} onClick={() => setSelectedPackage(pkg)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Plane className="w-6 h-6 text-primary" /></div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg">{pkg.name}</h3>
                      {pkg.short_description && <p className="text-muted-foreground text-sm mt-1">{pkg.short_description}</p>}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-4 h-4" />{pkg.duration_minutes} {t('common.minutes')}</span>
                        <span className="font-bold text-primary">{formatCurrency(pkg.base_price_huf)}</span>
                      </div>
                    </div>
                    {selectedPackage?.id === pkg.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-primary-foreground" /></div>}
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-end pt-4"><Button onClick={() => setStep('details')} disabled={!selectedPackage} className="gap-2">{t('common.next')}<ChevronRight className="w-4 h-4" /></Button></div>
          </div>
        )}

        {step === 'details' && (
          <Card>
            <CardHeader><CardTitle>{t('voucher.recipientDetails')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="recipientName">{t('voucher.recipientName')} *</Label><Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="recipientEmail">{t('voucher.recipientEmail')} ({t('common.optional')})</Label><Input id="recipientEmail" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="personalMessage">{t('voucher.personalMessage')} ({t('common.optional')})</Label><Textarea id="personalMessage" value={personalMessage} onChange={(e) => setPersonalMessage(e.target.value)} rows={3} /></div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('package')}><ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}</Button>
                <Button onClick={() => setStep('confirm')} disabled={!recipientName.trim()} className="gap-2">{t('common.next')}<ChevronRight className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'confirm' && selectedPackage && (
          <Card>
            <CardHeader><CardTitle>{t('voucher.confirm')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3"><Plane className="w-5 h-5 text-primary" /><span className="font-semibold">{selectedPackage.name}</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" />{selectedPackage.duration_minutes} {t('common.minutes')}</div>
              </div>
              <div className="space-y-2">
                <p><strong>{t('voucher.recipient')}:</strong> {recipientName}</p>
                {recipientEmail && <p><strong>{t('common.email')}:</strong> {recipientEmail}</p>}
                {personalMessage && <p className="italic text-muted-foreground border-l-2 border-primary/30 pl-3">"{personalMessage}"</p>}
              </div>
              <div className="flex items-center justify-between py-4 border-t border-b border-border">
                <span className="text-lg font-medium">{t('voucher.total')}</span>
                <span className="text-2xl font-bold font-display text-primary">{formatCurrency(selectedPackage.base_price_huf)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('voucher.validityInfo')}</p>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('details')}><ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="gap-2 gradient-primary text-primary-foreground">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}{t('voucher.create')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseVoucher;
