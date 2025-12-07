import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-2">
        {t('common.welcome')}
      </h2>
      
      <h3 className="text-xl font-display font-semibold text-foreground mb-6">
        {t('nav.home')}
      </h3>

      {/* Main Images */}
      <div className="space-y-8">
        {/* First Image - Cockpit */}
        <div className="text-center">
          <a 
            href="http://vimeo.com/10713979" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block group"
          >
            <img 
              src="https://varigyula.hu/images/stories/0009_cl.jpg" 
              alt="Vári Gyula a pilótafülkében" 
              className="max-w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-border"
            />
          </a>
          <p className="mt-3 text-primary font-medium">{t('common.clickImage')}</p>
        </div>

        {/* Second Image - Portrait */}
        <div className="text-center">
          <Link to="/rolam" className="inline-block group">
            <img 
              src="https://varigyula.hu/images/stories/vgy_cl.jpg" 
              alt="Vári Gyula portré" 
              className="max-w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-border"
            />
          </Link>
          <p className="mt-3 text-primary font-medium">{t('common.clickImage')}</p>
        </div>

        {/* Third Image - MiG-29 */}
        <div className="text-center">
          <a 
            href="http://hu.wikipedia.org/wiki/MiG–29" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block group"
          >
            <img 
              src="https://varigyula.hu/images/stories/001.jpg" 
              alt="MiG-29 vadászrepülőgép" 
              className="max-w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-border"
            />
          </a>
          <p className="mt-3 text-primary font-medium">{t('common.clickImage')}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
