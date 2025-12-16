import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Shield, UserPlus, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { PasswordGenerator } from '@/components/auth/PasswordGenerator';
import { validatePasswordStrength } from '@/lib/passwordValidation';
import { normalizeIdentifier } from '@/lib/identifierUtils';

const AdminLogin: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapMode, setIsBootstrapMode] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);
  
  // Bootstrap form
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminIdentifier, setNewAdminIdentifier] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  
  const { signIn, user, userRole, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkBootstrapStatus();
  }, []);

  useEffect(() => {
    // If already logged in as admin, redirect
    if (user && userRole && profile?.status === 'active') {
      if (['super_admin', 'operator_admin', 'operator_staff'].includes(userRole.role)) {
        navigate('/admin');
      }
    }
  }, [user, userRole, profile, navigate]);

  const checkBootstrapStatus = async () => {
    try {
      // Use SECURITY DEFINER function to bypass RLS
      const { data: exists, error } = await supabase.rpc('check_super_admin_exists');

      if (error) {
        console.error('Error checking super admin:', error);
        // On error, show bootstrap mode as safe fallback
        setIsBootstrapMode(true);
      } else {
        // If no super_admin exists, enter bootstrap mode
        setIsBootstrapMode(!exists);
      }
    } catch (error) {
      console.error('Error in checkBootstrapStatus:', error);
      setIsBootstrapMode(true); // Safe fallback
    } finally {
      setCheckingBootstrap(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normalize identifier (add @admin.internal if not an email)
      const normalizedEmail = normalizeIdentifier(identifier);
      
      const { error, status } = await signIn(normalizedEmail, password);

      if (error) {
        if (error.message === 'account_pending') {
          toast({
            title: language === 'hu' ? 'Fiók jóváhagyásra vár' : 'Account pending approval',
            description: language === 'hu' 
              ? 'A fiókod még jóváhagyásra vár. Kérlek várj, amíg egy adminisztrátor aktiválja.'
              : 'Your account is pending approval. Please wait for an administrator to activate it.',
            variant: 'destructive',
          });
        } else if (error.message === 'account_suspended') {
          toast({
            title: language === 'hu' ? 'Fiók felfüggesztve' : 'Account suspended',
            description: language === 'hu'
              ? 'A fiókod felfüggesztésre került.'
              : 'Your account has been suspended.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: language === 'hu' ? 'Bejelentkezési hiba' : 'Login error',
            description: language === 'hu' 
              ? 'Hibás azonosító vagy jelszó'
              : 'Invalid identifier or password',
            variant: 'destructive',
          });
        }
        return;
      }

      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: language === 'hu' ? 'Váratlan hiba történt' : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate password confirmation
      if (newAdminPassword !== newAdminConfirmPassword) {
        toast({
          title: language === 'hu' ? 'Jelszavak nem egyeznek' : 'Passwords do not match',
          description: language === 'hu'
            ? 'A két jelszó mező tartalma nem egyezik.'
            : 'The password confirmation does not match.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Validate password strength (check against name and identifier)
      const passwordStrength = validatePasswordStrength(newAdminPassword, newAdminIdentifier, newAdminName);
      if (!passwordStrength.isStrong) {
        toast({
          title: language === 'hu' ? 'Gyenge jelszó' : 'Weak password',
          description: language === 'hu' 
            ? 'A jelszónak meg kell felelnie minden követelménynek.'
            : 'Password must meet all requirements.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Validate phone format (if provided)
      if (newAdminPhone.length > 0) {
        const phoneRegex = /^\+[1-9][\d\s]{7,17}$/;
        const cleanPhone = newAdminPhone.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          toast({
            title: language === 'hu' ? 'Érvénytelen telefonszám' : 'Invalid phone number',
            description: language === 'hu' 
              ? 'Kérlek add meg az országkódot (pl. +36...)'
              : 'Please include the country code (e.g., +36...)',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      }

      // Normalize identifier (convert username to internal email if needed)
      const normalizedEmail = normalizeIdentifier(newAdminIdentifier);

      // Create new super admin auth user
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: newAdminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: newAdminName,
            phone: newAdminPhone,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Use the security definer function to create profile and role
        const { data: result, error: fnError } = await supabase
          .rpc('create_first_super_admin', {
            _user_id: data.user.id,
            _full_name: newAdminName,
            _phone: newAdminPhone || null,
          });

        if (fnError) {
          throw fnError;
        }

        if (!result) {
          toast({
            title: language === 'hu' ? 'Hiba' : 'Error',
            description: language === 'hu' 
              ? 'Már létezik Super Admin a rendszerben'
              : 'A Super Admin already exists in the system',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: language === 'hu' ? 'Super Admin létrehozva!' : 'Super Admin created!',
          description: language === 'hu'
            ? 'Most már bejelentkezhetsz az új fiókkal.'
            : 'You can now log in with the new account.',
        });

        setIsBootstrapMode(false);
        setNewAdminIdentifier('');
        setNewAdminPassword('');
        setNewAdminConfirmPassword('');
        setNewAdminName('');
        setNewAdminPhone('');
      }
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingBootstrap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen sky-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-display text-3xl font-bold text-primary">VÁRI GYULA</h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            {language === 'hu' ? 'Adminisztráció' : 'Administration'}
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          {isBootstrapMode ? (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-display font-semibold text-center mb-2">
                {language === 'hu' ? 'Első Super Admin létrehozása' : 'Create First Super Admin'}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                {language === 'hu' 
                  ? 'Hozd létre az első Super Admin fiókot a platform kezeléséhez.'
                  : 'Create the first Super Admin account to manage the platform.'}
              </p>
              <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {language === 'hu' ? 'Teljes név' : 'Full Name'}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identifier">
                    {language === 'hu' ? 'Azonosító (felhasználónév vagy e-mail)' : 'Identifier (username or email)'}
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={language === 'hu' ? 'admin vagy admin@pelda.hu' : 'admin or admin@example.com'}
                    value={newAdminIdentifier}
                    onChange={(e) => setNewAdminIdentifier(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'hu' 
                      ? 'Megadhatsz egyszerű felhasználónevet vagy e-mail címet'
                      : 'You can use a simple username or email address'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {language === 'hu' ? 'Telefonszám (opcionális)' : 'Phone Number (optional)'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+36 30 123 4567"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => { setNewAdminPassword(e.target.value); setNewAdminConfirmPassword(''); }}
                    required
                  />
                  <PasswordGenerator 
                    onAccept={(password) => { setNewAdminPassword(password); setNewAdminConfirmPassword(password); }} 
                  />
                  <PasswordStrengthIndicator password={newAdminPassword} userName={newAdminIdentifier} fullName={newAdminName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {language === 'hu' ? 'Jelszó megerősítése' : 'Confirm Password'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newAdminConfirmPassword}
                    onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                    required
                  />
                  {newAdminConfirmPassword && newAdminPassword !== newAdminConfirmPassword && (
                    <p className="text-xs text-destructive">
                      {language === 'hu' ? 'A jelszavak nem egyeznek' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !validatePasswordStrength(newAdminPassword, newAdminIdentifier, newAdminName).isStrong || newAdminPassword !== newAdminConfirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {language === 'hu' ? 'Létrehozás...' : 'Creating...'}
                    </>
                  ) : (
                    language === 'hu' ? 'Super Admin létrehozása' : 'Create Super Admin'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-display font-semibold text-center mb-6">
                {language === 'hu' ? 'Admin bejelentkezés' : 'Admin Login'}
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">
                    {language === 'hu' ? 'Azonosító (felhasználónév vagy e-mail)' : 'Identifier (username or email)'}
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={language === 'hu' ? 'admin vagy admin@pelda.hu' : 'admin or admin@example.com'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    t('auth.signIn')
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="text-primary hover:underline">
            {language === 'hu' ? '← Vissza a főoldalra' : '← Back to home'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
