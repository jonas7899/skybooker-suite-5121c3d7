import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error, status } = await signIn(email, password);

      if (error) {
        if (error.message === 'account_pending') {
          toast({
            title: language === 'hu' ? 'Fiók jóváhagyásra vár' : 'Account pending approval',
            description: language === 'hu' 
              ? 'A fiókod még jóváhagyásra vár. Kérlek várj, amíg egy adminisztrátor aktiválja.'
              : 'Your account is pending approval. Please wait for an administrator to activate it.',
            variant: 'destructive',
          });
        } else if (error.message === 'cooldown_active') {
          toast({
            title: language === 'hu' ? 'Regisztráció elutasítva' : 'Registration rejected',
            description: language === 'hu'
              ? 'A regisztrációd elutasításra került. 24 óra múlva újra próbálkozhatsz.'
              : 'Your registration was rejected. You can try again in 24 hours.',
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
        } else if (error.message === 'account_inactive') {
          toast({
            title: language === 'hu' ? 'Fiók inaktív' : 'Account inactive',
            description: language === 'hu'
              ? 'A fiókod inaktív.'
              : 'Your account is inactive.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: language === 'hu' ? 'Bejelentkezési hiba' : 'Login error',
            description: language === 'hu' 
              ? 'Hibás email cím vagy jelszó.'
              : 'Invalid email or password.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: language === 'hu' ? 'Sikeres bejelentkezés!' : 'Login successful!',
        description: language === 'hu' ? 'Üdvözlünk!' : 'Welcome!',
      });

      navigate('/');
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

  return (
    <div className="min-h-screen sky-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-display text-3xl font-bold text-primary">VÁRI GYULA</h1>
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <h2 className="text-xl font-display font-semibold text-center mb-6">{t('auth.login')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
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
          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}
            </p>
            <Link to="/regisztracio" className="block">
              <Button variant="outline" className="w-full">
                {t('auth.register')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
