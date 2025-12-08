import React from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { GiftVoucher } from '@/types/voucher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Plane, Calendar, Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface VoucherCardProps {
  voucher: GiftVoucher;
  onDownloadPDF?: (voucher: GiftVoucher) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, onDownloadPDF }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: t('voucher.active'), className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    redeemed: { label: t('voucher.redeemed'), className: 'bg-primary/10 text-primary' },
    expired: { label: t('voucher.expired'), className: 'bg-muted text-muted-foreground' },
  };

  const status = statusConfig[voucher.status];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.voucher_code);
    setCopied(true);
    toast({ title: t('voucher.copied'), description: voucher.voucher_code });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(value);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-2 gradient-primary" />
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Gift className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-display font-semibold text-lg">{voucher.flight_package?.name || 'Repülési csomag'}</h3>
                <p className="text-sm text-muted-foreground">{t('voucher.for')}: {voucher.recipient_name}</p>
              </div>
              <Badge className={cn('shrink-0', status.className)}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-2 my-4 p-3 bg-muted/50 rounded-lg">
              <code className="text-lg font-mono font-bold text-primary flex-1">{voucher.voucher_code}</code>
              <Button variant="ghost" size="sm" onClick={handleCopyCode} className="shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5"><Plane className="w-4 h-4" /><span>{voucher.flight_package?.duration_minutes} {t('common.minutes')}</span></div>
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{t('voucher.validUntil')}: {format(new Date(voucher.expires_at), 'yyyy. MMM d.', { locale: hu })}</span></div>
            </div>
            {voucher.personal_message && <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3 mb-4">"{voucher.personal_message}"</p>}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-lg font-bold font-display">{formatCurrency(voucher.purchase_price_huf)}</span>
              {voucher.status === 'active' && onDownloadPDF && (
                <Button variant="outline" size="sm" onClick={() => onDownloadPDF(voucher)} className="gap-2">
                  <Download className="w-4 h-4" />{t('voucher.downloadPDF')}
                </Button>
              )}
              {voucher.status === 'redeemed' && voucher.redeemed_at && (
                <span className="text-sm text-muted-foreground">{t('voucher.redeemedOn')}: {format(new Date(voucher.redeemed_at), 'yyyy. MMM d.', { locale: hu })}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
