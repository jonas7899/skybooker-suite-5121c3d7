import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validatePasswordStrength } from '@/lib/passwordValidation';

const ChangePassword: React.FC = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = validatePasswordStrength(formData.newPassword, user?.email || '', profile?.full_name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: language === 'hu' ? 'Az új jelszavak nem egyeznek.' : 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (!passwordStrength.isStrong) {
      toast({
        title: language === 'hu' ? 'Gyenge jelszó' : 'Weak password',
        description: language === 'hu' ? 'A jelszónak meg kell felelnie minden követelménynek.' : 'Password must meet all requirements.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      toast({
        title: language === 'hu' ? 'Jelszó módosítva' : 'Password changed',
        description: language === 'hu' ? 'Az új jelszavad sikeresen beállítva.' : 'Your new password has been set.',
      });
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: language === 'hu' ? 'Nem sikerült módosítani a jelszót.' : 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/belepes');
    return null;
  }

  return (
    <div className="min-h-screen sky-background py-12 px-4">
      <div className="container mx-auto max-w-lg">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'hu' ? 'Vissza' : 'Back'}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'hu' ? 'Jelszó módosítás' : 'Change Password'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'Adj meg egy új, erős jelszót.' 
                : 'Enter a new, strong password.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {language === 'hu' ? 'Új jelszó' : 'New Password'}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
                <PasswordStrengthIndicator 
                  password={formData.newPassword} 
                  userName={user.email || ''} 
                  fullName={profile?.full_name || ''} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {language === 'hu' ? 'Új jelszó megerősítése' : 'Confirm New Password'}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {language === 'hu' ? 'A jelszavak nem egyeznek' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !passwordStrength.isStrong || formData.newPassword !== formData.confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {language === 'hu' ? 'Mentés...' : 'Saving...'}
                  </>
                ) : (
                  language === 'hu' ? 'Jelszó módosítása' : 'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
