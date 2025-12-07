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
  
  // Common
  'common.welcome': { hu: 'Vári Gyula és csapata köszönt Téged!', en: 'Vári Gyula and his team welcome you!' },
  'common.phone': { hu: 'Telefon', en: 'Phone' },
  'common.email': { hu: 'Email', en: 'Email' },
  'common.contact': { hu: 'Elérhetőségeink', en: 'Contact Info' },
  'common.mainMenu': { hu: 'Főmenü', en: 'Main Menu' },
  'common.date': { hu: 'dátum', en: 'date' },
  'common.clickImage': { hu: 'Kattints a képre!', en: 'Click on the image!' },
  'common.readMore': { hu: 'Tovább olvasom', en: 'Read more' },
  'common.loginRequired': { hu: 'Ez a tartalom csak bejelentkezett felhasználóknak érhető el.', en: 'This content is only available to logged-in users.' },
  
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
