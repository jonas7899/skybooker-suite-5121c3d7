import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validatePasswordStrength } from '@/lib/passwordValidation';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    // International phone format: starts with +, followed by country code and number
    const phoneRegex = /^\+[1-9][\d\s]{7,17}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate phone
    if (!validatePhone(formData.phone)) {
      toast({
        title: language === 'hu' ? 'Érvénytelen telefonszám' : 'Invalid phone number',
        description: language === 'hu' 
          ? 'Kérlek add meg a telefonszámot nemzetközi formátumban (pl. +36 30 123 4567)'
          : 'Please enter your phone number in international format (e.g., +36 30 123 4567)',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength (check against name and email)
    const passwordStrength = validatePasswordStrength(formData.password, formData.email, formData.name);
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

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone.replace(/\s/g, '') // Remove spaces from phone
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: language === 'hu' ? 'Email már használatban' : 'Email already in use',
            description: language === 'hu'
              ? 'Ez az email cím már regisztrálva van.'
              : 'This email address is already registered.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: language === 'hu' ? 'Regisztrációs hiba' : 'Registration error',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: language === 'hu' ? 'Sikeres regisztráció!' : 'Registration successful!',
        description: language === 'hu'
          ? 'A fiókod jóváhagyásra vár. Értesítünk, ha aktiválják.'
          : 'Your account is pending approval. We will notify you when it is activated.',
      });

      navigate('/belepes');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: language === 'hu' ? 'Hiba' : 'Error',
        description: language === 'hu' ? 'Váratlan hiba történt' : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = validatePasswordStrength(formData.password, formData.email, formData.name);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl gradient-sky flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold mt-6 mb-2">
            {language === 'hu' ? 'Fiók létrehozása' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hu' 
              ? 'Regisztrálj és foglald le repülésedet!'
              : 'Register and book your flight!'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {language === 'hu' ? 'Teljes név' : 'Full Name'}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={language === 'hu' ? 'Minta János' : 'John Doe'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="pelda@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                placeholder="+36 30 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                {language === 'hu' 
                  ? 'Nemzetközi formátum országkóddal (pl. +36, +1, +44)'
                  : 'International format with country code (e.g., +36, +1, +44)'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <PasswordStrengthIndicator password={formData.password} userName={formData.email} fullName={formData.name} />
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              disabled={isLoading || !passwordStrength.isStrong}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {language === 'hu' ? 'Regisztráció...' : 'Registering...'}
                </>
              ) : (
                language === 'hu' ? 'Regisztráció' : 'Create Account'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {language === 'hu'
                ? 'A regisztrációd jóváhagyásra vár, miután a stáb ellenőrizte.'
                : 'Your registration will be pending approval after staff verification.'}
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.hasAccount')}{' '}
            <Link to="/belepes" className="text-primary font-medium hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
