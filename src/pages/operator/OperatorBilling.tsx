import React, { useState } from 'react';
import { CreditCard, Calendar, Receipt, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionStatusBadge from '@/components/subscription/SubscriptionStatusBadge';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

const OperatorBilling: React.FC = () => {
  // TODO: Get actual operator ID from auth context
  const operatorId = 'demo-operator-id';
  const { operator, subscriptionInfo, isLoading, updateBillingInfo } = useSubscription(operatorId);
  
  const [billingEmail, setBillingEmail] = useState('');
  const [billingName, setBillingName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (operator) {
      setBillingEmail(operator.billing_email || '');
      setBillingName(operator.billing_name || '');
    }
  }, [operator]);

  const handleSaveBilling = async () => {
    setIsSaving(true);
    await updateBillingInfo(billingEmail, billingName);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Előfizetés és számlázás
        </h1>
        <p className="text-muted-foreground">
          Kezelje előfizetését és számlázási adatait
        </p>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Jelenlegi előfizetés
          </CardTitle>
          <CardDescription>
            Az Ön aktív előfizetésének részletei
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Státusz</p>
              {subscriptionInfo && (
                <SubscriptionStatusBadge 
                  status={subscriptionInfo.status} 
                  daysRemaining={subscriptionInfo.daysRemaining}
                />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Csomag</p>
              <p className="font-semibold">Havi előfizetés</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Díj</p>
              <p className="text-2xl font-display font-bold">
                {subscriptionInfo?.priceHuf.toLocaleString('hu-HU')} Ft
                <span className="text-sm font-normal text-muted-foreground">/hó</span>
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Kezdés dátuma</p>
                  <p className="font-medium">
                    {subscriptionInfo?.startedAt 
                      ? format(subscriptionInfo.startedAt, 'yyyy. MMMM d.', { locale: hu })
                      : 'Még nem aktív'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Következő számlázás</p>
                  <p className="font-medium">
                    {subscriptionInfo?.expiresAt 
                      ? format(subscriptionInfo.expiresAt, 'yyyy. MMMM d.', { locale: hu })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!subscriptionInfo?.isActive && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium">
                Az előfizetése lejárt vagy inaktív. A repülési csomagok és időpontok nem jelennek meg a nyilvános oldalon.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Számlázási adatok
          </CardTitle>
          <CardDescription>
            A számlázáshoz szükséges adatok
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingName">Cégnév / Név</Label>
              <Input
                id="billingName"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                placeholder="Vállalkozás neve"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Számlázási email</Label>
              <Input
                id="billingEmail"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="szamla@ceg.hu"
              />
            </div>
          </div>
          <Button onClick={handleSaveBilling} disabled={isSaving}>
            {isSaving ? 'Mentés...' : 'Adatok mentése'}
          </Button>
        </CardContent>
      </Card>

      {/* Payment History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Fizetési előzmények
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Még nincsenek fizetési előzmények.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorBilling;
