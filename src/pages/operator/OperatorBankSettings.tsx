import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOperatorSettings } from '@/hooks/useOperatorSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, Save, Building, FileText } from 'lucide-react';
import { toast } from 'sonner';

const OperatorBankSettings: React.FC = () => {
  const { userRole } = useAuth();
  const { language } = useLanguage();
  const operatorId = userRole?.operator_id || '';
  const { settings, isLoading, updateSettings } = useOperatorSettings(operatorId);

  const [formData, setFormData] = useState({
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    support_description: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        bank_name: settings.bank_name || '',
        bank_account_name: settings.bank_account_name || '',
        bank_account_number: settings.bank_account_number || '',
        support_description: settings.support_description || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateSettings(formData);

    if (!error) {
      toast.success(language === 'hu' ? 'Beállítások mentve' : 'Settings saved');
    } else {
      toast.error(language === 'hu' ? 'Hiba történt a mentés során' : 'Error saving settings');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {language === 'hu' ? 'Bankszámla és támogatás beállítások' : 'Bank Account & Support Settings'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'hu' 
            ? 'Add meg a bankszámla adatokat, ahova a támogatók utalhatnak'
            : 'Enter the bank account details where supporters can send donations'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Bankszámla adatok' : 'Bank Account Details'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'Ezek az adatok jelennek meg a támogatók számára'
                : 'These details will be shown to supporters'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">{language === 'hu' ? 'Bank neve' : 'Bank Name'}</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder={language === 'hu' ? 'pl. OTP Bank' : 'e.g. Chase Bank'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account_name">{language === 'hu' ? 'Számla tulajdonos neve' : 'Account Holder Name'}</Label>
              <Input
                id="bank_account_name"
                value={formData.bank_account_name}
                onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                placeholder={language === 'hu' ? 'pl. Orion Sportrepülő Egyesület' : 'e.g. Flight Club Inc.'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account_number">{language === 'hu' ? 'Bankszámlaszám' : 'Account Number'}</Label>
              <Input
                id="bank_account_number"
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                placeholder={language === 'hu' ? 'pl. 11111111-22222222-33333333' : 'e.g. HU42 1234 5678 9012 3456 7890 1234'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Támogatás leírása' : 'Support Description'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'Magyarázó szöveg a támogatóknak (a Támogatás oldalon jelenik meg)'
                : 'Explanatory text for supporters (shown on the Support page)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.support_description}
              onChange={(e) => setFormData({ ...formData, support_description: e.target.value })}
              placeholder={language === 'hu' 
                ? 'Írd le, hogyan működik a támogatás, mire megy a befizetett összeg, stb.'
                : 'Describe how the support works, what the donations are used for, etc.'}
              rows={6}
            />
          </CardContent>
        </Card>

        <Button type="submit" variant="gradient" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving 
            ? (language === 'hu' ? 'Mentés...' : 'Saving...')
            : (language === 'hu' ? 'Beállítások mentése' : 'Save Settings')
          }
        </Button>
      </form>
    </div>
  );
};

export default OperatorBankSettings;
