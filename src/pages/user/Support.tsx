import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupportTier } from '@/hooks/useSupportTier';
import { useOperatorSettings } from '@/hooks/useOperatorSettings';
import { ArrowLeft, Medal, Copy, Check, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Hardcoded operator ID for now - in production this would come from config or route
const DEFAULT_OPERATOR_ID = '';

const Support: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { supportTiers, isLoading: tiersLoading } = useSupportTier(DEFAULT_OPERATOR_ID || undefined);
  const { settings, isLoading: settingsLoading } = useOperatorSettings(DEFAULT_OPERATOR_ID || undefined);
  const [copied, setCopied] = useState(false);

  const loading = tiersLoading || settingsLoading;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: language === 'hu' ? 'Másolva!' : 'Copied!',
        description: language === 'hu' ? 'Bankszámlaszám a vágólapra másolva.' : 'Bank account number copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: language === 'hu' ? 'Nem sikerült másolni.' : 'Failed to copy.',
        variant: 'destructive',
      });
    }
  };

  const getTierColor = (color: string) => {
    const colors: Record<string, string> = {
      '#CD7F32': 'bg-amber-700',
      '#C0C0C0': 'bg-gray-400',
      '#FFD700': 'bg-yellow-500',
      '#E5E4E2': 'bg-gray-200',
    };
    return colors[color] || 'bg-primary';
  };

  return (
    <div className="min-h-screen sky-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'hu' ? 'Vissza' : 'Back'}
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              {language === 'hu' ? 'Támogatás' : 'Support'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'Az Orion Sportrepülő Egyesület támogatásával ajándék élményrepülést kapsz!' 
                : 'By supporting the Orion Flying Club, you receive a complimentary experience flight!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm">
                {language === 'hu' 
                  ? 'Ha támogatod az egyesületet, ajándékba kapsz tőlünk egy élményrepülést. A befizetés után az operátor beállítja a támogatói fokozatodat, és máris foglalhatsz időpontot!' 
                  : 'If you support the association, you will receive a complimentary experience flight. After payment, the operator will set your support tier, and you can book a slot!'}
              </p>
            </div>

            {settings?.support_description && (
              <p className="text-muted-foreground">{settings.support_description}</p>
            )}
          </CardContent>
        </Card>

        {/* Support Tiers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {language === 'hu' ? 'Támogatói fokozatok' : 'Support Tiers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">
                {language === 'hu' ? 'Betöltés...' : 'Loading...'}
              </p>
            ) : supportTiers.length === 0 ? (
              <p className="text-muted-foreground">
                {language === 'hu' 
                  ? 'Jelenleg nincsenek beállított támogatói fokozatok. Kérjük, érdeklődjön az operátornál.' 
                  : 'No support tiers are currently configured. Please contact the operator.'}
              </p>
            ) : (
              <div className="space-y-3">
                {supportTiers.map((tier) => (
                  <div 
                    key={tier.id} 
                    className="flex items-center justify-between p-4 rounded-lg border"
                    style={{ borderLeftColor: tier.color, borderLeftWidth: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <Medal className="w-5 h-5" style={{ color: tier.color }} />
                      <div>
                        <p className="font-semibold">{tier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tier.min_amount_eur} EUR
                          {tier.max_amount_eur 
                            ? ` - ${tier.max_amount_eur} EUR`
                            : '+'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: tier.color, color: tier.color === '#FFD700' || tier.color === '#E5E4E2' ? 'black' : 'white' }}
                    >
                      {tier.name}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'hu' ? 'Befizetési adatok' : 'Payment Details'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'Kérjük, utald át a támogatás összegét az alábbi bankszámlára:' 
                : 'Please transfer the support amount to the following bank account:'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings?.bank_account_number ? (
              <div className="space-y-4">
                {settings.bank_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hu' ? 'Bank neve' : 'Bank Name'}
                    </p>
                    <p className="font-medium">{settings.bank_name}</p>
                  </div>
                )}
                {settings.bank_account_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hu' ? 'Számlatulajdonos' : 'Account Holder'}
                    </p>
                    <p className="font-medium">{settings.bank_account_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Bankszámlaszám' : 'Account Number'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg">{settings.bank_account_number}</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(settings.bank_account_number!)}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="text-sm">
                    <strong>{language === 'hu' ? 'Megjegyzés:' : 'Note:'}</strong>{' '}
                    {language === 'hu' 
                      ? 'Kérjük, a közlemény rovatban tüntesd fel a nevedet és email címedet a beazonosításhoz!' 
                      : 'Please include your name and email in the payment reference for identification!'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {language === 'hu' 
                  ? 'A bankszámla adatokat az operátor még nem állította be. Kérjük, érdeklődjön náluk.' 
                  : 'Bank account details have not been configured yet. Please contact the operator.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
