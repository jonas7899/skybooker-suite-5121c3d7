import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SubscriptionStatus } from '@/types/subscription';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  daysRemaining?: number;
}

const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({ 
  status, 
  daysRemaining 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Aktív',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-500/20 text-green-400 border-green-500/30',
        };
      case 'trial':
        return {
          label: 'Próbaidőszak',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
      case 'expired':
        return {
          label: 'Lejárt',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-destructive/20 text-destructive border-destructive/30',
        };
      case 'cancelled':
        return {
          label: 'Lemondva',
          variant: 'outline' as const,
          icon: AlertTriangle,
          className: 'bg-muted text-muted-foreground border-border',
        };
      default:
        return {
          label: 'Ismeretlen',
          variant: 'outline' as const,
          icon: AlertTriangle,
          className: '',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
      {daysRemaining !== undefined && daysRemaining > 0 && status !== 'expired' && (
        <span className="text-xs text-muted-foreground">
          ({daysRemaining} nap van hátra)
        </span>
      )}
    </div>
  );
};

export default SubscriptionStatusBadge;
