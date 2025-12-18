import React, { useState, useEffect } from 'react';
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

const EditProfile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: language === 'hu' ? 'Profil frissítve' : 'Profile updated',
        description: language === 'hu' ? 'Az adataid sikeresen mentve.' : 'Your data has been saved.',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: language === 'hu' ? 'Nem sikerült menteni az adatokat.' : 'Failed to save data.',
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
              {language === 'hu' ? 'Profilom szerkesztése' : 'Edit Profile'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'Frissítsd a személyes adataidat.' 
                : 'Update your personal information.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'hu' ? 'Az email cím nem módosítható.' : 'Email cannot be changed.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">
                  {language === 'hu' ? 'Teljes név' : 'Full Name'}
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {language === 'hu' ? 'Telefonszám' : 'Phone Number'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {language === 'hu' ? 'Mentés...' : 'Saving...'}
                  </>
                ) : (
                  language === 'hu' ? 'Mentés' : 'Save'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
