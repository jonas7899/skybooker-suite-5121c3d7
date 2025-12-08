import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { Loader2, User, Mail, Phone } from 'lucide-react';

const UserSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Validation schema
  const profileSchema = z.object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: t('settings.validation.nameRequired') })
      .max(100, { message: t('settings.validation.nameMax') }),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^(\+36|06)?[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}$/.test(val.replace(/\s/g, '')),
        { message: t('settings.validation.phoneInvalid') }
      ),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const result = profileSchema.safeParse({ fullName, phone: phone || undefined });
    
    if (!result.success) {
      const fieldErrors: { fullName?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'fullName') {
          fieldErrors.fullName = err.message;
        } else if (err.path[0] === 'phone') {
          fieldErrors.phone = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      
      toast.success(t('settings.success'), {
        description: t('settings.successDesc'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('settings.error'), {
        description: t('settings.errorDesc'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = 
    fullName !== (profile?.full_name || '') || 
    phone !== (profile?.phone || '');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {t('settings.profileInfo')}
        </h2>
        
        <div className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {t('settings.fullName')}
            </Label>
            <Input 
              id="fullName" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('settings.fullNamePlaceholder')}
              className={errors.fullName ? 'border-destructive' : ''}
              maxLength={100}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>
          
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {t('settings.email')}
            </Label>
            <Input 
              id="email" 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.emailNote')}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              {t('settings.phone')}
            </Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('settings.phonePlaceholder')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              variant="gradient" 
              disabled={isLoading || !hasChanges}
              className="min-w-[180px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('settings.saving')}
                </>
              ) : (
                t('settings.saveChanges')
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
