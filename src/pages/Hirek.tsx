import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import korosKerteszLogo from '@/assets/koros-kertesz.png';
import gyuriEsGyula from '@/assets/gyuri-es-gyula.jpg';
import hungarocontrolLogo from '@/assets/hungarocontrol-logo.jpg';

const Hirek: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">
        {language === 'hu' ? 'Hírek, információk' : 'News & Information'}
      </h2>

      <div className="space-y-8">
        {/* Köszönetnyilvánítás */}
        <article className="border-b border-border pb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-48 flex-shrink-0">
              <img 
                src={korosKerteszLogo} 
                alt="Kőrös-KerTÉSZ Zrt. logó" 
                className="w-full h-auto rounded-lg border border-border"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {language === 'hu' ? 'Köszönetnyilvánítás' : 'Acknowledgment'}
              </h3>
              <p className="text-foreground">
                {language === 'hu' 
                  ? 'Ezúttal is köszönjük a Kőrös-KerTÉSZ Zrt-nek a repülős rendezvény támogatását.' 
                  : 'We would like to thank Kőrös-KerTÉSZ Zrt. again for supporting the aviation event.'}
              </p>
            </div>
          </div>
        </article>

        {/* Szabi blog-bejegyzése */}
        <article className="border-b border-border pb-8">
          <h3 className="text-xl font-display font-semibold text-foreground mb-3">
            {language === 'hu' ? 'Szabi blog-bejegyzése a repülésről' : 'Szabi\'s blog post about flying'}
          </h3>
          <div className="prose prose-sm max-w-none text-foreground space-y-4">
            {language === 'hu' ? (
              <>
                <p className="italic">
                  "...többször volt már szerencsém elmenni Gyulával repülni. Mindannyiszor élmény, mert Gyula ezerrel nyomja. 
                  Az elején, mint mindenki én is kicsit tartottam attól, hogy mi lesz ha... de aztán Gyula eloszlatta a 
                  félelmeimet. Örülök annak, hogy mikor elmegyünk repülni néha elbeszélgetünk a repülésről, mert sok olyan 
                  dolgot hallok Gyulától amit sehol nem olvasok..."
                </p>
                <p>
                  <strong>Köszönjük Szabi!</strong> A teljes blog-bejegyzés{' '}
                  <a 
                    href="http://szabilull.blog.hu/2013/01/01/vorosmarty_mihaly_szep_ilonka" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    itt olvasható
                  </a>.
                </p>
                <p>
                  Köszönjük továbbá Vári Gyulának és csapatának az élményeket!
                </p>
              </>
            ) : (
              <>
                <p className="italic">
                  "...I've had the chance to go flying with Gyula several times. It's always an experience because Gyula 
                  goes all out. At first, like everyone, I was a bit worried about what if... but then Gyula dispelled 
                  my fears. I'm glad that when we go flying, we sometimes chat about aviation, because I hear many things 
                  from Gyula that I don't read anywhere..."
                </p>
                <p>
                  <strong>Thank you Szabi!</strong> The full blog post can be read{' '}
                  <a 
                    href="http://szabilull.blog.hu/2013/01/01/vorosmarty_mihaly_szep_ilonka" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    here
                  </a>.
                </p>
                <p>
                  We also thank Vári Gyula and his team for the experiences!
                </p>
              </>
            )}
          </div>
        </article>

        {/* Gyuri rövid története */}
        <article className="border-b border-border pb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <img 
                src={gyuriEsGyula} 
                alt={language === 'hu' ? 'Gyuri és Vári Gyula' : 'Gyuri and Vári Gyula'} 
                className="w-full h-auto rounded-lg border border-border shadow-md"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {language === 'hu' 
                  ? 'Gyuri rövid története... / SEGÍTS, hogy az álom valóra válhasson!' 
                  : 'Gyuri\'s short story... / HELP make the dream come true!'}
              </h3>
              <div className="prose prose-sm max-w-none text-foreground space-y-3">
                {language === 'hu' ? (
                  <>
                    <p>
                      Gyuri 23 éves. Az SZTE Juhász Gyula Főiskolai Kar hallgatója. Van egy álma, de sajnos anyagi 
                      lehetőségei végesek. A célja az, hogy pilóta lehessen. Az álom megvalósításában szeretnénk 
                      segíteni neki.
                    </p>
                    <p>
                      Mindenkit arra kérünk, aki teheti, támogassa Gyurit, hogy az álma valóra válhasson!
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Gyuri is 23 years old. He is a student at SZTE Juhász Gyula Faculty. He has a dream, but 
                      unfortunately his financial possibilities are limited. His goal is to become a pilot. 
                      We would like to help him realize his dream.
                    </p>
                    <p>
                      We ask everyone who can to support Gyuri so that his dream can come true!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Gyuri születésnapi meglepetése */}
        <article className="border-b border-border pb-8">
          <h3 className="text-xl font-display font-semibold text-foreground mb-3">
            {language === 'hu' ? 'Gyuri születésnapi meglepetése' : 'Gyuri\'s birthday surprise'}
          </h3>
          <p className="text-foreground">
            {language === 'hu' ? (
              <>
                Egy kedves meglepetés! A képes beszámoló megtekinthető a{' '}
                <a 
                  href="https://www.facebook.com/media/set/?set=a.10152162095380498.1073741828.652980497&type=1&l=1c2fc06c02" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Facebook oldalunkon
                </a>.
              </>
            ) : (
              <>
                A lovely surprise! The photo report can be viewed on our{' '}
                <a 
                  href="https://www.facebook.com/media/set/?set=a.10152162095380498.1073741828.652980497&type=1&l=1c2fc06c02" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Facebook page
                </a>.
              </>
            )}
          </p>
        </article>

        {/* Hungarocontrol */}
        <article className="pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-48 flex-shrink-0">
              <img 
                src={hungarocontrolLogo} 
                alt="HungaroControl logó" 
                className="w-full h-auto rounded-lg border border-border"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {language === 'hu' ? 'Hungarocontrol - Napi légtérhasználati terv' : 'Hungarocontrol - Daily Airspace Usage Plan'}
              </h3>
              <div className="prose prose-sm max-w-none text-foreground space-y-3">
                {language === 'hu' ? (
                  <>
                    <p>
                      A HungaroControl Magyar Légiforgalmi Szolgálat Zrt. a magyar légtér irányításáért és 
                      a légiforgalmi szolgáltatásokért felelős szervezet.
                    </p>
                    <p>
                      További információk és a napi légtérhasználati terv elérhető a{' '}
                      <a 
                        href="http://www.hungarocontrol.hu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        hungarocontrol.hu
                      </a>{' '}
                      weboldalon.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      HungaroControl Hungarian Air Navigation Services is the organization responsible for 
                      managing Hungarian airspace and providing air traffic services.
                    </p>
                    <p>
                      More information and the daily airspace usage plan is available at{' '}
                      <a 
                        href="http://www.hungarocontrol.hu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        hungarocontrol.hu
                      </a>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Hirek;
