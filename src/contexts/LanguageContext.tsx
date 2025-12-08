import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'hu' | 'en';

interface Translations {
  [key: string]: {
    hu: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  'nav.home': { hu: 'Címlap', en: 'Home' },
  'nav.news': { hu: 'Hírek, információk', en: 'News & Info' },
  'nav.about': { hu: 'Vári Gyuláról', en: 'About Vári Gyula' },
  'nav.contact': { hu: 'Kapcsolatfelvétel', en: 'Contact' },
  'nav.gallery': { hu: 'Arcképcsarnok', en: 'Gallery' },
  'nav.forum': { hu: 'Fórum', en: 'Forum' },
  'nav.schedule': { hu: 'Időpontok', en: 'Schedule' },
  
  // Auth
  'auth.login': { hu: 'Belépés', en: 'Login' },
  'auth.logout': { hu: 'Kilépés', en: 'Logout' },
  'auth.register': { hu: 'Regisztráció', en: 'Register' },
  'auth.username': { hu: 'Felhasználónév', en: 'Username' },
  'auth.password': { hu: 'Jelszó', en: 'Password' },
  'auth.email': { hu: 'Email cím', en: 'Email address' },
  'auth.rememberMe': { hu: 'Emlékezzen rám', en: 'Remember me' },
  'auth.forgotPassword': { hu: 'Elfelejtette jelszavát?', en: 'Forgot password?' },
  'auth.noAccount': { hu: 'Nincs még fiókja?', en: "Don't have an account?" },
  'auth.hasAccount': { hu: 'Van már fiókja?', en: 'Already have an account?' },
  'auth.createAccount': { hu: 'Fiók létrehozása', en: 'Create account' },
  'auth.signIn': { hu: 'Bejelentkezés', en: 'Sign In' },
  'auth.signingIn': { hu: 'Bejelentkezés...', en: 'Signing in...' },
  'auth.required': { hu: 'Bejelentkezés szükséges', en: 'Login required' },
  
  // Common
  'common.welcome': { hu: 'Vári Gyula és csapata köszönt Téged!', en: 'Vári Gyula and his team welcome you!' },
  'common.phone': { hu: 'Telefon', en: 'Phone' },
  'common.email': { hu: 'Email', en: 'Email' },
  'common.contact': { hu: 'Elérhetőségeink', en: 'Contact Info' },
  'common.mainMenu': { hu: 'Főmenü', en: 'Main Menu' },
  'common.date': { hu: 'dátum', en: 'date' },
  'common.clickImage': { hu: 'Kattints a képre!', en: 'Click on the image!' },
  'common.readMore': { hu: 'Tovább olvasom', en: 'Read more' },
  'common.weather': { hu: 'Időjárás - Kecskemét', en: 'Weather - Kecskemét' },
  'common.loginRequired': { hu: 'Ez a tartalom csak bejelentkezett felhasználóknak érhető el.', en: 'This content is only available to logged-in users.' },
  'common.back': { hu: 'Vissza', en: 'Back' },
  'common.next': { hu: 'Tovább', en: 'Next' },
  'common.cancel': { hu: 'Mégse', en: 'Cancel' },
  'common.minutes': { hu: 'perc', en: 'minutes' },
  'common.optional': { hu: 'opcionális', en: 'optional' },
  
  // Footer
  'footer.rights': { hu: 'Minden jog fenntartva.', en: 'All rights reserved.' },
  
  // Days
  'day.sunday': { hu: 'Vasárnap', en: 'Sunday' },
  'day.monday': { hu: 'Hétfő', en: 'Monday' },
  'day.tuesday': { hu: 'Kedd', en: 'Tuesday' },
  'day.wednesday': { hu: 'Szerda', en: 'Wednesday' },
  'day.thursday': { hu: 'Csütörtök', en: 'Thursday' },
  'day.friday': { hu: 'Péntek', en: 'Friday' },
  'day.saturday': { hu: 'Szombat', en: 'Saturday' },

  // Analytics
  'analytics.title': { hu: 'Analitika', en: 'Analytics' },
  'analytics.subtitle': { hu: 'Teljesítmény áttekintés', en: 'Performance overview' },
  'analytics.week': { hu: 'Hét', en: 'Week' },
  'analytics.month': { hu: 'Hónap', en: 'Month' },
  'analytics.totalRevenue': { hu: 'Összes bevétel', en: 'Total Revenue' },
  'analytics.confirmedBookings': { hu: 'Megerősített foglalások', en: 'Confirmed Bookings' },
  'analytics.avgValue': { hu: 'Átlagos érték', en: 'Average Value' },
  'analytics.utilization': { hu: 'Kihasználtság', en: 'Utilization' },
  'analytics.revenueOverTime': { hu: 'Bevétel alakulása', en: 'Revenue Over Time' },
  'analytics.bookingsByPackage': { hu: 'Foglalások csomagonként', en: 'Bookings by Package' },
  'analytics.slotUtilization': { hu: 'Időpont kihasználtság', en: 'Slot Utilization' },
  'analytics.summary': { hu: 'Összefoglaló', en: 'Summary' },
  'analytics.noData': { hu: 'Nincs adat ebben az időszakban', en: 'No data for this period' },
  'analytics.noSlots': { hu: 'Nincsenek időpontok', en: 'No slots available' },
  'analytics.available': { hu: 'Szabad', en: 'Available' },
  'analytics.booked': { hu: 'Foglalt', en: 'Booked' },
  'analytics.totalBookings': { hu: 'Összes foglalás', en: 'Total Bookings' },
  'analytics.confirmed': { hu: 'Megerősített', en: 'Confirmed' },
  'analytics.cancelled': { hu: 'Lemondva', en: 'Cancelled' },
  'analytics.packages': { hu: 'Aktív csomag', en: 'Active Packages' },

  // Vouchers
  'voucher.active': { hu: 'Aktív', en: 'Active' },
  'voucher.redeemed': { hu: 'Beváltva', en: 'Redeemed' },
  'voucher.expired': { hu: 'Lejárt', en: 'Expired' },
  'voucher.copied': { hu: 'Kód másolva', en: 'Code copied' },
  'voucher.for': { hu: 'Címzett', en: 'Recipient' },
  'voucher.validUntil': { hu: 'Érvényes', en: 'Valid until' },
  'voucher.downloadPDF': { hu: 'PDF letöltése', en: 'Download PDF' },
  'voucher.redeemedOn': { hu: 'Beváltva', en: 'Redeemed on' },
  'vouchers.title': { hu: 'Utalványaim', en: 'My Vouchers' },
  'vouchers.subtitle': { hu: 'Vásárolt ajándékutalványaid', en: 'Your purchased gift vouchers' },
  'vouchers.new': { hu: 'Új utalvány', en: 'New Voucher' },
  'vouchers.empty.title': { hu: 'Még nincs utalványod', en: 'No vouchers yet' },
  'vouchers.empty.description': { hu: 'Vásárolj ajándékutalványt szeretteidnek!', en: 'Buy a gift voucher for your loved ones!' },
  'vouchers.buyFirst': { hu: 'Utalvány vásárlása', en: 'Buy Voucher' },
  'vouchers.active': { hu: 'Aktív utalványok', en: 'Active Vouchers' },
  'vouchers.used': { hu: 'Beváltott / Lejárt', en: 'Used / Expired' },
  'voucher.downloaded': { hu: 'Utalvány letöltve', en: 'Voucher downloaded' },
  'voucher.purchase.title': { hu: 'Ajándékutalvány vásárlása', en: 'Purchase Gift Voucher' },
  'voucher.purchase.subtitle': { hu: 'Lepd meg szeretteidet', en: 'Surprise your loved ones' },
  'voucher.loginRequired': { hu: 'Be kell jelentkezned', en: 'You need to log in' },
  'voucher.step.package': { hu: 'Csomag', en: 'Package' },
  'voucher.step.details': { hu: 'Adatok', en: 'Details' },
  'voucher.step.confirm': { hu: 'Megerősítés', en: 'Confirm' },
  'voucher.noPackages': { hu: 'Nincs elérhető csomag', en: 'No packages available' },
  'voucher.recipientDetails': { hu: 'Címzett adatai', en: 'Recipient Details' },
  'voucher.recipientName': { hu: 'Címzett neve', en: 'Recipient Name' },
  'voucher.recipientEmail': { hu: 'Címzett email', en: 'Recipient Email' },
  'voucher.personalMessage': { hu: 'Személyes üzenet', en: 'Personal Message' },
  'voucher.confirm': { hu: 'Összesítő', en: 'Summary' },
  'voucher.recipient': { hu: 'Címzett', en: 'Recipient' },
  'voucher.total': { hu: 'Összesen', en: 'Total' },
  'voucher.validityInfo': { hu: 'Az utalvány 1 évig érvényes', en: 'Voucher valid for 1 year' },
  'voucher.create': { hu: 'Létrehozás', en: 'Create' },
  'voucher.created': { hu: 'Utalvány létrehozva!', en: 'Voucher created!' },
  'voucher.createdDesc': { hu: 'Sikeresen elkészült', en: 'Successfully created' },
  'error.title': { hu: 'Hiba', en: 'Error' },
  'error.generic': { hu: 'Valami hiba történt', en: 'Something went wrong' },

  // Waiting List
  'waitingList.join': { hu: 'Várólista', en: 'Waiting List' },
  'waitingList.onList': { hu: 'Várólistán vagy', en: 'On waiting list' },
  'waitingList.title': { hu: 'Feliratkozás várólistára', en: 'Join Waiting List' },
  'waitingList.description': { hu: 'Értesítünk ha hely szabadul', en: 'We will notify you when a spot opens' },
  'waitingList.passengers': { hu: 'Hány főre?', en: 'How many passengers?' },
  'waitingList.subscribe': { hu: 'Feliratkozás', en: 'Subscribe' },
  'waitingList.joined': { hu: 'Feliratkoztál!', en: 'You joined!' },
  'waitingList.joinedDesc': { hu: 'Értesítünk ha hely szabadul', en: 'We will notify you' },
  'waitingList.loginRequired': { hu: 'Be kell jelentkezned', en: 'You need to log in' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hu');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
