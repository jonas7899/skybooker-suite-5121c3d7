import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Hirek: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">
        {language === 'hu' ? 'Hírek, információk' : 'News & Information'}
      </h2>

      <div className="space-y-6">
        {/* Sample news items */}
        <article className="border-b border-border pb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            {language === 'hu' ? 'Üdvözöljük a megújult weboldalon!' : 'Welcome to the renewed website!'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">2025. december 7.</p>
          <p className="text-foreground">
            {language === 'hu' 
              ? 'Köszöntjük Önöket a Vári Gyula weboldal frissített változatán. Hamarosan új tartalmakkal bővülünk!' 
              : 'We welcome you to the updated version of the Vári Gyula website. We will soon be expanding with new content!'}
          </p>
        </article>

        <article className="border-b border-border pb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            {language === 'hu' ? 'Repülőnapi események' : 'Air Show Events'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">2025. augusztus 20.</p>
          <p className="text-foreground">
            {language === 'hu' 
              ? 'Az idei repülőnapon ismét láthatják a MiG-29 bemutatót. Részletes program hamarosan!' 
              : 'This year\'s air show will again feature the MiG-29 demonstration. Detailed program coming soon!'}
          </p>
        </article>

        <article className="pb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            {language === 'hu' ? 'Archívum' : 'Archive'}
          </h3>
          <p className="text-foreground">
            {language === 'hu' 
              ? 'A korábbi hírek és információk hamarosan elérhetőek lesznek az archívumban.' 
              : 'Previous news and information will soon be available in the archive.'}
          </p>
        </article>
      </div>
    </div>
  );
};

export default Hirek;
