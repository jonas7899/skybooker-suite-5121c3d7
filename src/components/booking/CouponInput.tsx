import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePricing } from '@/hooks/usePricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, X, Check, Loader2 } from 'lucide-react';
import { Coupon } from '@/types/pricing';

interface CouponInputProps {
  packageId?: string;
  appliedCoupon: Coupon | null;
  onCouponApplied: (coupon: Coupon | null) => void;
}

const CouponInput = ({ packageId, appliedCoupon, onCouponApplied }: CouponInputProps) => {
  const { language } = useLanguage();
  const { validateCoupon, loading, error, clearError } = usePricing();
  const [code, setCode] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    
    const coupon = await validateCoupon(code, packageId);
    if (coupon) {
      onCouponApplied(coupon);
      setCode('');
    }
  };

  const handleRemove = () => {
    onCouponApplied(null);
    clearError();
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span className="font-mono font-medium">{appliedCoupon.code}</span>
          <Badge variant="secondary" className="text-green-600">
            {appliedCoupon.discount_type === 'percentage' 
              ? `-${appliedCoupon.discount_value}%` 
              : `-${appliedCoupon.discount_value.toLocaleString()} Ft`}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              clearError();
            }}
            placeholder={language === 'hu' ? 'Kuponkód' : 'Coupon code'}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button onClick={handleApply} disabled={loading || !code.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            language === 'hu' ? 'Beváltás' : 'Apply'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default CouponInput;
