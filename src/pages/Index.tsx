import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const windfinderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (windfinderRef.current) {
      // Clear previous content
      windfinderRef.current.innerHTML = '';
      
      // Create and append the script
      const script = document.createElement('script');
      script.src = 'https://www.windfinder.com/widget/forecast/js/kecskemet?unit_wave=m&unit_rain=mm&unit_temperature=c&unit_wind=kts&unit_pressure=hPa&days=4&show_day=1&show_waves=0';
      script.async = true;
      windfinderRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">
        {t('nav.home')}
      </h2>

      {/* Windfinder Weather Widget */}
      <div className="bg-card border border-border rounded-lg p-4 mb-8 shadow-sm">
        <h4 className="text-lg font-display font-semibold text-primary mb-3">
          {t('common.weather')}
        </h4>
        <div ref={windfinderRef} className="windfinder-widget" />
        <noscript>
          <a rel="nofollow" href="https://www.windfinder.com/forecast/kecskemet?utm_source=forecast&utm_medium=web&utm_campaign=homepageweather&utm_content=noscript-forecast">
            Wind forecast for Kecskemét Air Base
          </a> provided by <a rel="nofollow" href="https://www.windfinder.com?utm_source=forecast&utm_medium=web&utm_campaign=homepageweather&utm_content=noscript-logo">windfinder.com</a>
        </noscript>
      </div>

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
