import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVouchers } from '@/hooks/useVouchers';
import { useLanguage } from '@/contexts/LanguageContext';
import { VoucherCard } from '@/components/vouchers/VoucherCard';
import { Button } from '@/components/ui/button';
import { Gift, Plus, Loader2 } from 'lucide-react';
import { GiftVoucher } from '@/types/voucher';
import { toast } from '@/hooks/use-toast';

const UserVouchers: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { vouchers, loading, error, fetchUserVouchers } = useVouchers();

  useEffect(() => { fetchUserVouchers(); }, []);

  const handleDownloadPDF = (voucher: GiftVoucher) => {
    const content = `AJÁNDÉKUTALVÁNY\n\nKód: ${voucher.voucher_code}\nCsomag: ${voucher.flight_package?.name}\nCímzett: ${voucher.recipient_name}\nÉrvényes: ${new Date(voucher.expires_at).toLocaleDateString('hu-HU')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utalvany-${voucher.voucher_code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t('voucher.downloaded'), description: voucher.voucher_code });
  };

  const activeVouchers = vouchers.filter(v => v.status === 'active');
  const usedVouchers = vouchers.filter(v => v.status !== 'active');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{t('vouchers.title')}</h1>
          <p className="text-muted-foreground">{t('vouchers.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/utalvany')} className="gap-2"><Plus className="w-4 h-4" />{t('vouchers.new')}</Button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
      {error && <div className="text-center py-12 text-destructive">{error}</div>}

      {!loading && !error && vouchers.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6"><Gift className="w-8 h-8 text-muted-foreground" /></div>
          <h2 className="text-xl font-display font-semibold mb-2">{t('vouchers.empty.title')}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('vouchers.empty.description')}</p>
          <Button onClick={() => navigate('/utalvany')} className="gap-2"><Gift className="w-4 h-4" />{t('vouchers.buyFirst')}</Button>
        </div>
      )}

      {!loading && activeVouchers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold">{t('vouchers.active')} ({activeVouchers.length})</h2>
          <div className="grid gap-4">{activeVouchers.map((v) => <VoucherCard key={v.id} voucher={v} onDownloadPDF={handleDownloadPDF} />)}</div>
        </div>
      )}

      {!loading && usedVouchers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-muted-foreground">{t('vouchers.used')} ({usedVouchers.length})</h2>
          <div className="grid gap-4 opacity-75">{usedVouchers.map((v) => <VoucherCard key={v.id} voucher={v} />)}</div>
        </div>
      )}
    </div>
  );
};

export default UserVouchers;
