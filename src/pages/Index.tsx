import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import vgyCockpit from '@/assets/vgy-cockpit.jpg';
import portrait from '@/assets/portrait.jpg';
import mig29Flight from '@/assets/mig29-flight.jpg';

const Index: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">
        {t('nav.home')}
      </h2>

      {/* Main Images */}
      <div className="space-y-8">
        {/* First Image - Cockpit */}
        <div className="text-center">
          <a 
            href="https://www.youtube.com/watch?v=c2PmFwrRROI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block group"
          >
            <img 
              src={vgyCockpit} 
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
              src={portrait} 
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
              src={mig29Flight} 
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
