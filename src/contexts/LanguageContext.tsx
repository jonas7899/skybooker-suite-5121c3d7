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
  
  // Dashboard Navigation
  'dashboard.nav.dashboard': { hu: 'Irányítópult', en: 'Dashboard' },
  'dashboard.nav.operators': { hu: 'Operátorok', en: 'Operators' },
  'dashboard.nav.users': { hu: 'Felhasználók', en: 'Users' },
  'dashboard.nav.subscriptions': { hu: 'Előfizetések', en: 'Subscriptions' },
  'dashboard.nav.analytics': { hu: 'Analitika', en: 'Analytics' },
  'dashboard.nav.settings': { hu: 'Beállítások', en: 'Settings' },
  'dashboard.nav.calendar': { hu: 'Naptár', en: 'Calendar' },
  'dashboard.nav.flights': { hu: 'Repülések', en: 'Flights' },
  'dashboard.nav.bookings': { hu: 'Foglalások', en: 'Bookings' },
  'dashboard.nav.staff': { hu: 'Személyzet', en: 'Staff' },
  'dashboard.nav.myFlights': { hu: 'Repüléseim', en: 'My Flights' },
  'dashboard.nav.favorites': { hu: 'Kedvencek', en: 'Favorites' },
  'dashboard.nav.signOut': { hu: 'Kijelentkezés', en: 'Sign Out' },
  
  // Role badges
  'role.superAdmin': { hu: 'Szuper Admin', en: 'Super Admin' },
  'role.operatorAdmin': { hu: 'Operátor Admin', en: 'Operator Admin' },
  'role.staff': { hu: 'Személyzet', en: 'Staff' },
  'role.member': { hu: 'Tag', en: 'Member' },
  
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

  // Admin Dashboard
  'admin.dashboard.title': { hu: 'Platform áttekintés', en: 'Platform Overview' },
  'admin.dashboard.subtitle': { hu: 'Szuper Admin Vezérlőpult', en: 'Super Admin Dashboard' },
  'admin.dashboard.totalOperators': { hu: 'Összes operátor', en: 'Total Operators' },
  'admin.dashboard.activeUsers': { hu: 'Aktív felhasználók', en: 'Active Users' },
  'admin.dashboard.activeSubscriptions': { hu: 'Aktív előfizetések', en: 'Active Subscriptions' },
  'admin.dashboard.monthlyRevenue': { hu: 'Havi bevétel', en: 'Monthly Revenue' },
  'admin.dashboard.recentOperators': { hu: 'Legutóbbi operátorok', en: 'Recent Operators' },
  'admin.dashboard.noOperators': { hu: 'Még nincs regisztrált operátor.', en: 'No operators registered yet.' },
  'admin.dashboard.recentActivity': { hu: 'Legutóbbi aktivitás', en: 'Recent Activity' },
  'admin.dashboard.noActivity': { hu: 'Nincs megjeleníthető aktivitás.', en: 'No recent activity to display.' },

  // Admin Subscriptions
  'admin.subscriptions.title': { hu: 'Előfizetések', en: 'Subscriptions' },
  'admin.subscriptions.subtitle': { hu: 'Operátor előfizetések kezelése', en: 'Manage operator subscriptions' },
  'admin.subscriptions.active': { hu: 'Aktív', en: 'Active' },
  'admin.subscriptions.trial': { hu: 'Próba', en: 'Trial' },
  'admin.subscriptions.expired': { hu: 'Lejárt', en: 'Expired' },
  'admin.subscriptions.empty.title': { hu: 'Még nincs előfizetés', en: 'No subscriptions yet' },
  'admin.subscriptions.empty.description': { hu: 'Az operátor előfizetések itt jelennek meg.', en: 'Operator subscriptions will appear here once operators subscribe.' },

  // Admin Analytics
  'admin.analytics.title': { hu: 'Platform Analitika', en: 'Platform Analytics' },
  'admin.analytics.subtitle': { hu: 'Platformszintű teljesítmény figyelése', en: 'Monitor platform-wide performance' },
  'admin.analytics.comingSoon': { hu: 'Analitika hamarosan', en: 'Analytics coming soon' },
  'admin.analytics.comingSoonDesc': { hu: 'A platform analitika elérhető lesz, amint az operátorok elkezdik használni a platformot.', en: 'Platform analytics will be available once operators start using the platform.' },

  // Admin Settings
  'admin.settings.title': { hu: 'Platform beállítások', en: 'Platform Settings' },
  'admin.settings.subtitle': { hu: 'Platformszintű beállítások konfigurálása', en: 'Configure platform-wide settings' },
  'admin.settings.general': { hu: 'Általános beállítások', en: 'General Settings' },
  'admin.settings.platformName': { hu: 'Platform neve', en: 'Platform Name' },
  'admin.settings.supportEmail': { hu: 'Support email', en: 'Support Email' },
  'admin.settings.saveChanges': { hu: 'Mentés', en: 'Save Changes' },
  'admin.settings.pricing': { hu: 'Árazás', en: 'Pricing' },
  'admin.settings.pricingDesc': { hu: 'Operátor előfizetési árazás', en: 'Operator subscription pricing' },
  'admin.settings.monthlyPrice': { hu: 'Havi ár (HUF)', en: 'Monthly Price (HUF)' },
  'admin.settings.trialDays': { hu: 'Próbaidőszak (nap)', en: 'Trial Period (days)' },
  'admin.settings.updatePricing': { hu: 'Árazás frissítése', en: 'Update Pricing' },

  // Admin Operators
  'admin.operators.title': { hu: 'Operátorok kezelése', en: 'Manage Operators' },
  'admin.operators.subtitle': { hu: 'Repülési szolgáltatók és előfizetések kezelése', en: 'Manage flight providers and subscriptions' },
  'admin.operators.new': { hu: 'Új operátor', en: 'New Operator' },
  'admin.operators.total': { hu: 'Összes operátor', en: 'Total Operators' },
  'admin.operators.activeSubscription': { hu: 'Aktív előfizetés', en: 'Active Subscription' },
  'admin.operators.trial': { hu: 'Próbaidőszak', en: 'Trial Period' },
  'admin.operators.expired': { hu: 'Lejárt', en: 'Expired' },
  'admin.operators.list': { hu: 'Operátorok listája', en: 'Operators List' },
  'admin.operators.searchPlaceholder': { hu: 'Keresés név vagy slug alapján...', en: 'Search by name or slug...' },
  'admin.operators.statusFilter': { hu: 'Státusz szűrő', en: 'Status Filter' },
  'admin.operators.allStatus': { hu: 'Összes státusz', en: 'All Statuses' },
  'admin.operators.active': { hu: 'Aktív', en: 'Active' },
  'admin.operators.cancelled': { hu: 'Lemondva', en: 'Cancelled' },
  'admin.operators.noResults': { hu: 'Nincs találat', en: 'No results' },
  'admin.operators.operator': { hu: 'Operátor', en: 'Operator' },
  'admin.operators.status': { hu: 'Státusz', en: 'Status' },
  'admin.operators.expiry': { hu: 'Lejárat', en: 'Expiry' },
  'admin.operators.fee': { hu: 'Díj', en: 'Fee' },
  'admin.operators.actions': { hu: 'Műveletek', en: 'Actions' },
  'admin.operators.activate': { hu: 'Aktiválás', en: 'Activate' },
  'admin.operators.addMonth': { hu: '+1 hónap', en: '+1 month' },
  'admin.operators.addYear': { hu: '+12 hónap', en: '+12 months' },
  'admin.operators.markExpired': { hu: 'Lejártnak jelölés', en: 'Mark as Expired' },

  // Admin Users
  'admin.users.title': { hu: 'Felhasználók', en: 'Users' },
  'admin.users.subtitle': { hu: 'Felhasználók kezelése és jóváhagyása', en: 'Manage and approve users' },
  'admin.users.total': { hu: 'Összes felhasználó', en: 'Total Users' },
  'admin.users.pendingApproval': { hu: 'Jóváhagyásra vár', en: 'Pending Approval' },
  'admin.users.active': { hu: 'Aktív', en: 'Active' },
  'admin.users.suspendedRejected': { hu: 'Tiltott/Elutasított', en: 'Suspended/Rejected' },
  'admin.users.pendingTab': { hu: 'Jóváhagyásra vár', en: 'Pending' },
  'admin.users.allTab': { hu: 'Összes felhasználó', en: 'All Users' },
  'admin.users.pendingUsers': { hu: 'Jóváhagyásra váró felhasználók', en: 'Pending Users' },
  'admin.users.noPending': { hu: 'Nincs jóváhagyásra váró felhasználó', en: 'No pending users' },
  'admin.users.registered': { hu: 'Regisztrált:', en: 'Registered:' },
  'admin.users.approve': { hu: 'Jóváhagyás', en: 'Approve' },
  'admin.users.reject': { hu: 'Elutasítás', en: 'Reject' },
  'admin.users.searchPlaceholder': { hu: 'Keresés név vagy telefonszám alapján...', en: 'Search by name or phone...' },
  'admin.users.noResults': { hu: 'Nincs találat', en: 'No results' },
  'admin.users.name': { hu: 'Név', en: 'Name' },
  'admin.users.phone': { hu: 'Telefonszám', en: 'Phone' },
  'admin.users.role': { hu: 'Szerepkör', en: 'Role' },
  'admin.users.status': { hu: 'Státusz', en: 'Status' },
  'admin.users.registeredDate': { hu: 'Regisztráció', en: 'Registered' },
  'admin.users.actions': { hu: 'Műveletek', en: 'Actions' },
  'admin.users.activate': { hu: 'Aktiválás', en: 'Activate' },
  'admin.users.suspend': { hu: 'Felfüggesztés', en: 'Suspend' },
  'admin.users.rejectTitle': { hu: 'Regisztráció elutasítása', en: 'Reject Registration' },
  'admin.users.rejectDesc': { hu: 'A felhasználó 24 óra múlva újra regisztrálhat.', en: 'The user can register again after 24 hours.' },
  'admin.users.rejectReason': { hu: 'Elutasítás indoklása (opcionális)', en: 'Rejection reason (optional)' },
  'admin.users.cancel': { hu: 'Mégse', en: 'Cancel' },
  'admin.users.statusActive': { hu: 'Aktív', en: 'Active' },
  'admin.users.statusPending': { hu: 'Várakozó', en: 'Pending' },
  'admin.users.statusRejected': { hu: 'Elutasítva', en: 'Rejected' },
  'admin.users.statusSuspended': { hu: 'Felfüggesztve', en: 'Suspended' },
  'admin.users.statusInactive': { hu: 'Inaktív', en: 'Inactive' },
  'admin.users.roleStaff': { hu: 'Stáb', en: 'Staff' },
  'admin.users.roleUser': { hu: 'Felhasználó', en: 'User' },

  // Operator Dashboard
  'operator.dashboard.title': { hu: 'Operátor Irányítópult', en: 'Operator Dashboard' },
  'operator.dashboard.welcome': { hu: 'Üdvözöljük', en: 'Welcome back' },
  'operator.dashboard.activeFlights': { hu: 'Aktív repülések', en: 'Active Flights' },
  'operator.dashboard.totalBookings': { hu: 'Összes foglalás', en: 'Total Bookings' },
  'operator.dashboard.customers': { hu: 'Ügyfelek', en: 'Customers' },
  'operator.dashboard.revenue': { hu: 'Bevétel', en: 'Revenue' },
  'operator.dashboard.recentBookings': { hu: 'Legutóbbi foglalások', en: 'Recent Bookings' },
  'operator.dashboard.noRecentBookings': { hu: 'Nincs megjeleníthető foglalás.', en: 'No recent bookings to display.' },
  'operator.dashboard.upcomingFlights': { hu: 'Közelgő repülések', en: 'Upcoming Flights' },
  'operator.dashboard.noUpcomingFlights': { hu: 'Nincs beütemezett repülés.', en: 'No upcoming flights scheduled.' },

  // Operator Flights
  'operator.flights.title': { hu: 'Repülések', en: 'Flights' },
  'operator.flights.subtitle': { hu: 'Repülési élmények kezelése', en: 'Manage your flight experiences' },
  'operator.flights.addFlight': { hu: 'Új repülés', en: 'Add Flight' },
  'operator.flights.noFlights': { hu: 'Még nincs repülés létrehozva', en: 'No flights created yet' },
  'operator.flights.noFlightsDesc': { hu: 'Hozza létre az első repülési élményt és fogadjon foglalásokat.', en: 'Create your first flight experience and start accepting bookings.' },

  // Operator Staff
  'operator.staff.title': { hu: 'Személyzet kezelése', en: 'Staff Management' },
  'operator.staff.subtitle': { hu: 'Csapattagok kezelése', en: 'Manage your team members' },
  'operator.staff.inviteStaff': { hu: 'Meghívás', en: 'Invite Staff' },
  'operator.staff.noStaff': { hu: 'Még nincs csapattag', en: 'No staff members yet' },
  'operator.staff.noStaffDesc': { hu: 'Hívjon meg csapattagokat a foglalások és repülések kezeléséhez.', en: 'Invite team members to help manage bookings and flights.' },
  'operator.staff.accessRestricted': { hu: 'Hozzáférés korlátozva', en: 'Access Restricted' },
  'operator.staff.noPermission': { hu: 'Nincs jogosultsága a személyzet kezeléséhez. Forduljon az adminisztrátorhoz.', en: "You don't have permission to manage staff members. Contact your administrator." },

  // User Settings
  'settings.title': { hu: 'Beállítások', en: 'Settings' },
  'settings.subtitle': { hu: 'Fiók beállítások kezelése', en: 'Manage your account settings' },
  'settings.profileInfo': { hu: 'Profil adatok', en: 'Profile Information' },
  'settings.fullName': { hu: 'Teljes név', en: 'Full Name' },
  'settings.fullNamePlaceholder': { hu: 'Az Ön neve', en: 'Your name' },
  'settings.email': { hu: 'Email cím', en: 'Email' },
  'settings.emailPlaceholder': { hu: 'Az Ön email címe', en: 'Your email' },
  'settings.emailNote': { hu: 'Az email cím nem módosítható', en: 'Email cannot be changed' },
  'settings.phone': { hu: 'Telefonszám', en: 'Phone Number' },
  'settings.phonePlaceholder': { hu: '+36 XX XXX XXXX', en: '+36 XX XXX XXXX' },
  'settings.saveChanges': { hu: 'Változások mentése', en: 'Save Changes' },
  'settings.saving': { hu: 'Mentés...', en: 'Saving...' },
  'settings.success': { hu: 'Profil frissítve', en: 'Profile Updated' },
  'settings.successDesc': { hu: 'A változtatások sikeresen mentésre kerültek.', en: 'Your changes have been saved successfully.' },
  'settings.error': { hu: 'Hiba történt', en: 'Error' },
  'settings.errorDesc': { hu: 'Nem sikerült menteni a változtatásokat.', en: 'Failed to save changes.' },
  'settings.validation.nameRequired': { hu: 'A név megadása kötelező', en: 'Name is required' },
  'settings.validation.nameMax': { hu: 'A név maximum 100 karakter lehet', en: 'Name must be less than 100 characters' },
  'settings.validation.phoneInvalid': { hu: 'Érvénytelen telefonszám formátum', en: 'Invalid phone number format' },

  // Password Change
  'settings.password.title': { hu: 'Jelszó módosítása', en: 'Change Password' },
  'settings.password.current': { hu: 'Jelenlegi jelszó', en: 'Current Password' },
  'settings.password.new': { hu: 'Új jelszó', en: 'New Password' },
  'settings.password.confirm': { hu: 'Új jelszó megerősítése', en: 'Confirm New Password' },
  'settings.password.change': { hu: 'Jelszó módosítása', en: 'Change Password' },
  'settings.password.changing': { hu: 'Módosítás...', en: 'Changing...' },
  'settings.password.success': { hu: 'Jelszó módosítva', en: 'Password Changed' },
  'settings.password.successDesc': { hu: 'A jelszavad sikeresen módosítva lett.', en: 'Your password has been changed successfully.' },
  'settings.password.error': { hu: 'Hiba történt', en: 'Error' },
  'settings.password.errorDesc': { hu: 'Nem sikerült módosítani a jelszót.', en: 'Failed to change password.' },
  'settings.password.validation.required': { hu: 'A jelszó megadása kötelező', en: 'Password is required' },
  'settings.password.validation.minLength': { hu: 'A jelszónak legalább 6 karakter hosszúnak kell lennie', en: 'Password must be at least 6 characters' },
  'settings.password.validation.mismatch': { hu: 'A jelszavak nem egyeznek', en: 'Passwords do not match' },
  'settings.password.validation.wrongCurrent': { hu: 'A jelenlegi jelszó helytelen', en: 'Current password is incorrect' },
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
