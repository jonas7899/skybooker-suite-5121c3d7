import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const UserSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ 
    currentPassword?: string; 
    newPassword?: string; 
    confirmPassword?: string 
  }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Profile validation schema
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

  // Password validation schema
  const passwordSchema = z.object({
    currentPassword: z
      .string()
      .min(1, { message: t('settings.password.validation.required') }),
    newPassword: z
      .string()
      .min(6, { message: t('settings.password.validation.minLength') }),
    confirmPassword: z
      .string()
      .min(1, { message: t('settings.password.validation.required') }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('settings.password.validation.mismatch'),
    path: ['confirmPassword'],
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const result = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    
    if (!result.success) {
      const fieldErrors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setIsPasswordLoading(true);

    try {
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ currentPassword: t('settings.password.validation.wrongCurrent') });
        setIsPasswordLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success(t('settings.password.success'), {
        description: t('settings.password.successDesc'),
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(t('settings.password.error'), {
        description: t('settings.password.errorDesc'),
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const hasProfileChanges = 
    fullName !== (profile?.full_name || '') || 
    phone !== (profile?.phone || '');

  const hasPasswordInput = currentPassword && newPassword && confirmPassword;

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

      {/* Profile Information Form */}
      <form onSubmit={handleProfileSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
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
              disabled={isLoading || !hasProfileChanges}
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

      {/* Password Change Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          {t('settings.password.title')}
        </h2>
        
        <div className="space-y-5">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {t('settings.password.current')}
            </Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={passwordErrors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t('settings.password.new')}
            </Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={passwordErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('settings.password.confirm')}
            </Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={passwordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              variant="outline" 
              disabled={isPasswordLoading || !hasPasswordInput}
              className="min-w-[180px]"
            >
              {isPasswordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('settings.password.changing')}
                </>
              ) : (
                t('settings.password.change')
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
