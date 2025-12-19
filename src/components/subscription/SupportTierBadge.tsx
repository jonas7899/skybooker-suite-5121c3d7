import React from 'react';
import { Medal, Award, Trophy, Crown, Star, Gem } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SupportTier } from '@/hooks/useSupportTier';
import { useLanguage } from '@/contexts/LanguageContext';

interface SupportTierBadgeProps {
  tier: SupportTier | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  medal: Medal,
  award: Award,
  trophy: Trophy,
  crown: Crown,
  star: Star,
  gem: Gem,
};

const SupportTierBadge: React.FC<SupportTierBadgeProps> = ({ 
  tier, 
  size = 'md',
  showTooltip = true 
}) => {
  const { language } = useLanguage();

  if (!tier) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const IconComponent = iconMap[tier.icon || 'medal'] || Medal;
  const color = tier.color || '#CD7F32';

  const badge = (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 rounded-full border"
      style={{ 
        backgroundColor: `${color}20`,
        borderColor: `${color}40`,
      }}
    >
      <IconComponent 
        className={sizeClasses[size]} 
        style={{ color }}
      />
      <span 
        className="text-xs font-medium"
        style={{ color }}
      >
        {tier.name}
      </span>
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{tier.name}</p>
        <p className="text-xs text-muted-foreground">
          {language === 'hu' 
            ? `Támogatói fokozat: ${tier.min_amount_eur}${tier.max_amount_eur ? ` - ${tier.max_amount_eur}` : '+'} EUR`
            : `Support tier: ${tier.min_amount_eur}${tier.max_amount_eur ? ` - ${tier.max_amount_eur}` : '+'} EUR`
          }
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SupportTierBadge;
