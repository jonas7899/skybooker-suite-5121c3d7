import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import vgyMigCockpit from '@/assets/vgy-mig-cockpit.jpg';
import vgyPortrait from '@/assets/vgy-portrait.jpg';

const Rolam: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">
        {language === 'hu' ? 'Néhány szóban magamról' : 'A few words about myself'}
      </h2>

      <div className="float-right ml-6 mb-4">
        <img 
          src={vgyMigCockpit} 
          alt="Vári Gyula egy MiG-29 pilótafülkéjében" 
          className="w-48 md:w-64 h-auto rounded-lg shadow-md border border-border"
        />
      </div>

      <div className="prose prose-sm md:prose-base max-w-none text-foreground space-y-4">
        {language === 'hu' ? (
          <>
            <p>
              1967. május 6-án születtem Nagykőrösön. A repüléssel 15 éves koromban kerültem kapcsolatba. 
              Először a vitorlázó- majd a motoros gépek irányítását sajátítottam el. A kapcsolatból "szerelem" lett, 
              így nem volt kétséges, hogy a Kilián György Repülőtiszti Főiskolán tanulok tovább.
            </p>

            <p>
              1990-ben fejeztem be a főiskolát Kassán, a Repülőtiszti Főiskolán. Friss diplomával a kezemben 
              úgy érkeztem haza, hogy: Repülőt nekem, hisz újat mutatni úgysem tudnak! Tudtak. Itthon újra 
              véget nem érő tanulásba kellett kezdenem. Szolnokra kerültem. Itt általános katonai ismereteket 
              sajátítottam el és egy éven keresztül angolt tanultam.
            </p>

            <p>
              1991-től a Kecskeméti Repülőtéren az első hajószázadnál kaptam beosztást MiG-21 típusú repülőgépen. 
              Először a "Puma", majd a "Dongó" századnál. Utána pedig Angliában több hónapos kiképzésen vettem részt.
            </p>

            <p>
              1993-ban Oroszországban átképzésen vettem részt a MiG-29B és MiG-29UB típusokra.
            </p>

            <p>
              1994-ben British Council középfokú angol nyelvvizsga.
            </p>

            <p>
              1995-ben ismét egy több hónapos képzésen vettem részt századosként, ahol ezúttal vezetéselméletet 
              tanultam az Egyesült Államok MAXWELL repülőbázison, valamint Squadron Officer School századparancsnoki 
              képzésen vettem részt.
            </p>

            <p>
              1996-ban angol nyelvből felsőfokú nyelvvizsgát teszek, majd kineveznek a Magyar Légierő bemutató pilótájának. 
              A folyamatos tanulás mellett 3 felsőfokú nyelvvizsgát szereztem (cseh, szlovák, angol) és haladó szinten 
              beszélek még kettő másik nyelven is.
            </p>

            <p>
              1997-ben PPL és CPL kereskedelmi pilóta jogosítványt szerzek.
            </p>

            <p>
              1998-ban az angliai Fairfordban megrendezett Royal International Air Tattoo repülő show-n megkapom az 
              "Abszolút kategória" győztesének járó díjat, az "As the Crow Flies Trophy"-t.
            </p>

            <p>
              1999. Ismét Fairford. A Royal International Air Tattoo "Abszolút kategória" győztesének díja mellé, 
              az egy és kétüléses vadászrepülőgép kategóriában a legjobb bemutatóért járó díjat is nekem ítélték.
            </p>

            <p>
              2000. MH 59. Szentgyörgyi Dezső Repülőbázis Hadműveleti és Kiképzési Főnökség kiképzési részlege kiképző 
              tisztjévé neveznek ki. Májustól a www.jetfly.hu című, katonai repüléssel foglalkozó internetes magazin 
              főszerkesztői teendőit látom el.
            </p>

            <p>
              2001. Cottesmore, Royal International Air Tattoo (RIAT 2001). A több napos nemzetközi repülőnap záró 
              hangár partiján először a Lockheed-Martin cég által felajánlott "Cannestra Trophy" díjat, majd az 
              "Abszolút kategória" győztesének járó "As the Crow Flies Trophy"-t vehettem át.
            </p>

            <div className="bg-secondary/30 p-4 rounded-lg border border-border mt-6">
              <h3 className="font-display font-semibold text-foreground mb-2">Repült típusok:</h3>
              <p className="text-sm">
                L-29 "Delfin"; L-29R "Delfin"; L-39C "Albatros"; L-39 ZA "Albatros"; L-39V "Albatros"; 
                MiG-21 F13; MiG-21 MF; MiG-21 UM; MiG-29 B; MiG-29 UB; Jak-52; Jak-18T; Zlin-142; 
                Cessna 152; Cessna 172
              </p>
            </div>

            <p className="mt-6">
              Rengeteg levelet kapok, főleg tizenéves fiúktól, akik az én példámon keresztül keresnek kapaszkodókat 
              a szárnyaláshoz. Sokszor nem tudom megválaszolni a kérdéseket, mert ahogy nem lehet megfejteni a 
              Bölcsek Kövének titkát, ugyanúgy nehéz jelképes kulcsot adni egy érettségi előtt álló diáknak, 
              amivel beléphet a repülés világába.
            </p>

            <p className="text-lg font-display font-semibold text-primary mt-4">
              Ezt az utat mindenkinek saját erőből kell végigjárnia!
            </p>
          </>
        ) : (
          <>
            <p>
              I was born on May 6, 1967, in Nagykőrös. I first came into contact with flying at the age of 15. 
              First, I learned to control gliders, then motorized aircraft. The connection became "love," 
              so there was no doubt that I would continue my studies at the Kilián György Air Force Academy.
            </p>

            <p>
              I finished college in 1990 in Košice, at the Air Force Academy. With a fresh diploma in hand, 
              I came home thinking: Give me an airplane, they can't show me anything new anyway! They could. 
              At home, I had to start endless learning again. I was assigned to Szolnok, where I acquired 
              general military knowledge and studied English for a year.
            </p>

            <p>
              From 1991, I was assigned to the first squadron at Kecskemét Airport on MiG-21 aircraft. 
              First at the "Puma" squadron, then at the "Dongó" squadron. After that, I participated in 
              several months of training in England.
            </p>

            <p>
              In 1993, I underwent conversion training in Russia for the MiG-29B and MiG-29UB types.
            </p>

            <p>
              In 1996, I passed an advanced English language exam and was appointed as the demonstration pilot 
              of the Hungarian Air Force. In addition to continuous learning, I obtained 3 advanced language 
              certificates (Czech, Slovak, English) and speak two other languages at an advanced level.
            </p>

            <p>
              In 1998, at the Royal International Air Tattoo air show held in Fairford, England, I received 
              the "As the Crow Flies Trophy" award for the winner of the "Absolute Category."
            </p>

            <p>
              1999. Fairford again. In addition to the Royal International Air Tattoo "Absolute Category" 
              winner's award, I was also awarded the best demonstration prize in the single and two-seat 
              fighter aircraft category.
            </p>

            <div className="bg-secondary/30 p-4 rounded-lg border border-border mt-6">
              <h3 className="font-display font-semibold text-foreground mb-2">Aircraft types flown:</h3>
              <p className="text-sm">
                L-29 "Delfin"; L-29R "Delfin"; L-39C "Albatros"; L-39 ZA "Albatros"; L-39V "Albatros"; 
                MiG-21 F13; MiG-21 MF; MiG-21 UM; MiG-29 B; MiG-29 UB; Jak-52; Jak-18T; Zlin-142; 
                Cessna 152; Cessna 172
              </p>
            </div>

            <p className="mt-6">
              I receive many letters, mainly from teenage boys, who seek footholds for soaring through my example. 
              Often I cannot answer the questions, because just as the secret of the Philosopher's Stone cannot be 
              revealed, it is equally difficult to give a symbolic key to a student about to graduate that would 
              allow them to enter the world of aviation.
            </p>

            <p className="text-lg font-display font-semibold text-primary mt-4">
              Everyone must walk this path on their own!
            </p>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <img 
          src={vgyPortrait} 
          alt="Vári Gyula" 
          className="inline-block max-w-full h-auto rounded-lg shadow-md border border-border"
        />
      </div>
    </div>
  );
};

export default Rolam;
