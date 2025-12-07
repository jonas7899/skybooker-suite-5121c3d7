import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProtectedPage: React.FC<{ pageName: string }> = ({ pageName }) => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in text-center py-12">
      <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">{pageName}</h2>
      <p className="text-muted-foreground mb-6">{t('common.loginRequired')}</p>
      <Button asChild>
        <Link to="/belepes">{t('auth.login')}</Link>
      </Button>
    </div>
  );
};

export const Kapcsolat: React.FC = () => <ProtectedPage pageName="Kapcsolatfelvétel" />;
export const Arckepcsarnok: React.FC = () => <ProtectedPage pageName="Arcképcsarnok" />;
export const Forum: React.FC = () => <ProtectedPage pageName="Fórum" />;
