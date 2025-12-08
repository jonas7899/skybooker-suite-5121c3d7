import { useLanguage } from '@/contexts/LanguageContext';
import { PriceBreakdown as PriceBreakdownType } from '@/types/pricing';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Percent, Tag, Ticket } from 'lucide-react';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownType;
  passengerCount: number;
  pricePerPerson: number;
}

const PriceBreakdownComponent = ({ breakdown, passengerCount, pricePerPerson }: PriceBreakdownProps) => {
  const { language } = useLanguage();

  const hasDiscounts = breakdown.discountAmount > 0 || breakdown.campaignAmount > 0 || breakdown.couponAmount > 0;
  const totalSavings = breakdown.discountAmount + breakdown.campaignAmount + breakdown.couponAmount;

  return (
    <div className="space-y-3">
      {/* Base price */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {pricePerPerson.toLocaleString()} Ft × {passengerCount} {language === 'hu' ? 'fő' : 'person'}
        </span>
        <span>{breakdown.basePrice.toLocaleString()} Ft</span>
      </div>

      {/* Applied discounts */}
      {breakdown.appliedDiscount && (
        <div className="flex justify-between text-sm items-center">
          <span className="flex items-center gap-2 text-green-600">
            <Percent className="h-3 w-3" />
            {language === 'hu' ? 'Kedvezmény' : 'Discount'}
            <Badge variant="secondary" className="text-xs">
              {breakdown.appliedDiscount.discount_type === 'percentage' 
                ? `${breakdown.appliedDiscount.discount_value}%` 
                : `${breakdown.appliedDiscount.discount_value.toLocaleString()} Ft`}
            </Badge>
          </span>
          <span className="text-green-600">-{breakdown.discountAmount.toLocaleString()} Ft</span>
        </div>
      )}

      {breakdown.appliedCampaign && (
        <div className="flex justify-between text-sm items-center">
          <span className="flex items-center gap-2 text-orange-600">
            <Tag className="h-3 w-3" />
            {breakdown.appliedCampaign.name}
            <Badge variant="secondary" className="text-xs">
              {breakdown.appliedCampaign.discount_type === 'percentage' 
                ? `${breakdown.appliedCampaign.discount_value}%` 
                : `${breakdown.appliedCampaign.discount_value.toLocaleString()} Ft`}
            </Badge>
          </span>
          <span className="text-orange-600">-{breakdown.campaignAmount.toLocaleString()} Ft</span>
        </div>
      )}

      {breakdown.appliedCoupon && (
        <div className="flex justify-between text-sm items-center">
          <span className="flex items-center gap-2 text-primary">
            <Ticket className="h-3 w-3" />
            {breakdown.appliedCoupon.code}
            <Badge variant="secondary" className="text-xs">
              {breakdown.appliedCoupon.discount_type === 'percentage' 
                ? `${breakdown.appliedCoupon.discount_value}%` 
                : `${breakdown.appliedCoupon.discount_value.toLocaleString()} Ft`}
            </Badge>
          </span>
          <span className="text-primary">-{breakdown.couponAmount.toLocaleString()} Ft</span>
        </div>
      )}

      {hasDiscounts && <Separator />}

      {/* Total savings */}
      {totalSavings > 0 && (
        <div className="flex justify-between text-sm font-medium text-green-600">
          <span>{language === 'hu' ? 'Megtakarítás' : 'Total savings'}</span>
          <span>-{totalSavings.toLocaleString()} Ft</span>
        </div>
      )}

      {/* Final price */}
      <div className="flex justify-between items-center text-xl font-bold pt-2">
        <span>{language === 'hu' ? 'Fizetendő:' : 'Total:'}</span>
        <div className="text-right">
          {hasDiscounts && (
            <span className="text-sm font-normal text-muted-foreground line-through mr-2">
              {breakdown.basePrice.toLocaleString()} Ft
            </span>
          )}
          <span className={hasDiscounts ? 'text-green-600' : ''}>
            {breakdown.finalPrice.toLocaleString()} Ft
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdownComponent;
