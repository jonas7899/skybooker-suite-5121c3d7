# Program Követelmény Specifikáció

## Vári Gyula Sétarepülés Platform

**Verzió:** 1.0  
**Dátum:** 2024-12-17  
**Státusz:** Aktív fejlesztés alatt

---

## 1. Projekt Áttekintés

### 1.1 Célkitűzés

A Vári Gyula Sétarepülés Platform egy modern, felhő-alapú SaaS alkalmazás, amely sétarepülési szolgáltatók (előfizetők) számára biztosít komplex foglalási és üzletmenedzsment rendszert. A platform multi-tenant architektúrával működik, ahol minden előfizető (légitársaság/repülőiskola) elkülönített adattérben kezeli ügyfeleit, repülőcsomagjait és foglalásait.

### 1.2 Üzleti Modell

- **Előfizetési díj:** 9,999 HUF / hónap / előfizető
- **Próbaidőszak:** Támogatott (trial státusz)
- **Számlázás:** Havi ismétlődő

### 1.3 Érintettek (Stakeholders)

| Szerepkör | Leírás |
|-----------|--------|
| Platform Tulajdonos | A SaaS platform üzemeltetője (Super Admin) |
| Előfizető | Sétarepülési szolgáltató cég |
| Operátor | Az előfizető alkalmazottai (Admin/Staff) |
| Ügyfél | Repülést foglaló végfelhasználó |

---

## 2. Felhasználói Szerepkörök és Jogosultságok

### 2.1 Super Admin (Platform Adminisztrátor)

**Leírás:** A platform tulajdonosa, teljes rendszerszintű hozzáféréssel.

**Jogosultságok:**
- Előfizetők (Subscribers) létrehozása és kezelése
- Első Operátor Admin létrehozása előfizetőkhöz
- Előfizetések státuszának módosítása (active, trial, suspended, cancelled)
- Előfizetések meghosszabbítása
- Platform-szintű statisztikák megtekintése
- Minden felhasználó kezelése

**Bejelentkezés:** Rugalmas azonosító (felhasználónév VAGY email)

### 2.2 Operator Admin (Előfizető Adminisztrátor)

**Leírás:** Az előfizető cég tulajdonosa/vezetője.

**Jogosultságok:**
- Repülőcsomagok (Flight Packages) teljes kezelése (CRUD)
- Időpontok (Time Slots) létrehozása és kezelése
- Foglalások megtekintése és kezelése
- Árazási módosítók kezelése (kuponok, kedvezmények, kampányok)
- Operator Staff felhasználók létrehozása
- Várólisták kezelése
- Analitika és statisztikák megtekintése
- Ügyfelek jóváhagyása/elutasítása

**Bejelentkezés:** Rugalmas azonosító (felhasználónév VAGY email)

### 2.3 Operator Staff (Előfizető Munkatárs)

**Leírás:** Az előfizető cég alkalmazottja, korlátozott jogosultságokkal.

**Jogosultságok:**
- Repülőcsomagok megtekintése (csak olvasás)
- Időpontok megtekintése
- Foglalások megtekintése
- Ügyfelek jóváhagyása (ha engedélyezett)

**Bejelentkezés:** Rugalmas azonosító (felhasználónév VAGY email)

### 2.4 User (Regisztrált Ügyfél)

**Leírás:** Repülést foglaló végfelhasználó.

**Jogosultságok:**
- Elérhető repülőcsomagok böngészése
- Szabad időpontok megtekintése
- Foglalás létrehozása (csak jóváhagyott státusz esetén)
- Saját foglalások megtekintése és kezelése
- Ajándékutalványok vásárlása
- Várólistára feliratkozás
- Értesítések fogadása

**Bejelentkezés:** Email cím kötelező

---

## 3. Funkcionális Követelmények

### 3.1 Autentikáció és Felhasználókezelés

#### FR-AUTH-001: Regisztráció
- **Leírás:** Új felhasználók regisztrációja
- **Mezők:** Teljes név, Email, Telefonszám (nemzetközi formátum: +országkód + 8-15 számjegy)
- **Státusz:** Új regisztrációk "pending" státusszal jönnek létre
- **Validáció:** Email formátum, telefonszám formátum

#### FR-AUTH-002: Jelszó Követelmények
- **Minimum hossz:** 8 karakter
- **Kötelező elemek:** 
  - Legalább 1 nagybetű
  - Legalább 1 kisbetű
  - Legalább 1 szám
  - Legalább 1 speciális karakter
- **Vizuális visszajelzés:** Jelszó erősség indikátor

#### FR-AUTH-003: Bejelentkezés
- **Admin szerepkörök:** Felhasználónév VAGY email elfogadott
- **User szerepkör:** Csak email elfogadott
- **Automatikus átirányítás:** Szerepkör alapú dashboard-ra

#### FR-AUTH-004: Felhasználó Jóváhagyás
- **Folyamat:** Pending → Active (jóváhagyás) VAGY Pending → Rejected (elutasítás)
- **Elutasítás után:** 24 órás várakozási idő új regisztrációhoz
- **Jóváhagyó:** Operator Admin vagy Staff (ha engedélyezett)

#### FR-AUTH-005: Bootstrap Inicializálás
- **Feltétel:** Ha nincs Super Admin a rendszerben
- **Művelet:** Első Super Admin létrehozása egyéni hitelesítő adatokkal
- **Egyszeri:** Bootstrap felhasználó inaktiválódik az első valódi Super Admin létrehozása után

### 3.2 Előfizető Kezelés

#### FR-SUB-001: Előfizető Létrehozása
- **Jogosult:** Super Admin
- **Mezők:** Név, Slug (URL-barát azonosító), Számlázási adatok
- **Automatikus:** Első Operator Admin létrehozása

#### FR-SUB-002: Előfizetés Státuszok
| Státusz | Leírás | Hatás |
|---------|--------|-------|
| trial | Próbaidőszak | Teljes funkcionalitás |
| active | Aktív előfizetés | Teljes funkcionalitás |
| suspended | Felfüggesztett | Csomagok rejtve, foglalás tiltva |
| cancelled | Lemondott | Csomagok rejtve, foglalás tiltva |

#### FR-SUB-003: Előfizetés Meghosszabbítás
- **Jogosult:** Super Admin
- **Művelet:** Lejárati dátum kiterjesztése megadott hónapokkal

### 3.3 Repülőcsomag Kezelés

#### FR-PKG-001: Csomag Létrehozása
- **Jogosult:** Operator Admin
- **Kötelező mezők:**
  - Név
  - Rövid leírás
  - Részletes leírás
  - Útvonal leírás
  - Időtartam (perc)
  - Nehézségi szint (easy/medium/aerobatic)
  - Ajánlott közönség
  - Alapár (HUF)
  - Maximum utasszám
- **Opcionális:** Képgaléria

#### FR-PKG-002: Csomag Aktiválás/Deaktiválás
- **Művelet:** is_active kapcsoló
- **Hatás:** Inaktív csomagok nem jelennek meg publikusan

### 3.4 Időpont Kezelés

#### FR-SLOT-001: Időpont Létrehozása
- **Jogosult:** Operator Admin
- **Mezők:** Dátum, Kezdési idő, Időtartam, Maximum utasszám
- **Validáció:** Átfedés ellenőrzés

#### FR-SLOT-002: Időpont Státuszok
| Státusz | Leírás |
|---------|--------|
| available | Foglalható |
| booked | Teljesen lefoglalt |
| closed | Lezárt (manuálisan) |

#### FR-SLOT-003: Automatikus Státuszváltás
- **Trigger:** Amikor current_passengers >= max_passengers
- **Művelet:** Státusz átállítása "booked"-ra

### 3.5 Foglalási Rendszer

#### FR-BOOK-001: Foglalás Létrehozása
- **Jogosult:** Aktív státuszú User
- **Feltétel:** Időpont legalább 24 órával a repülés előtt
- **Folyamat:**
  1. Repülőcsomag kiválasztása
  2. Szabad időpont kiválasztása
  3. Utas adatok megadása
  4. Foglalás megerősítése

#### FR-BOOK-002: Foglalás Státuszok
| Státusz | Leírás |
|---------|--------|
| pending | Jóváhagyásra vár |
| confirmed | Megerősített |
| cancelled | Lemondott |

#### FR-BOOK-003: Foglalás Módosítás
- **Jogosult:** User (saját, pending státuszú) vagy Operator Admin
- **Művelet:** Státusz módosítás, utas adatok frissítése

### 3.6 Árazási Rendszer

#### FR-PRICE-001: Kuponkódok
- **Létrehozó:** Operator Admin
- **Típusok:** Százalékos VAGY fix összegű kedvezmény
- **Korlátozások:** Lejárati dátum, használati limit, csomag-specifikus

#### FR-PRICE-002: Csomag Kedvezmények
- **Feltételek:**
  - always (mindig érvényes)
  - weekday (hétköznap)
  - weekend (hétvége)
  - specific_days (megadott napok)

#### FR-PRICE-003: Kampányok
- **Időalapú:** Kezdő és záró dátum között aktív
- **Típusok:** Százalékos VAGY fix összegű kedvezmény

### 3.7 Értesítési Rendszer

#### FR-NOTIF-001: In-App Értesítések
- **Tárolás:** Adatbázisban
- **Megjelenítés:** Felhasználói dashboard-on
- **Típusok:**
  - booking_created
  - booking_confirmed
  - booking_cancelled
  - account_activated
  - account_rejected
  - account_suspended
  - waiting_list_available

#### FR-NOTIF-002: Emlékeztető Értesítések
- **24 órával repülés előtt:** Automatikus emlékeztető
- **1 héttel repülés előtt:** Automatikus emlékeztető (ha van annyi idő)

### 3.8 Várólista Rendszer

#### FR-WAIT-001: Várólistára Feliratkozás
- **Feltétel:** Teljesen lefoglalt időpont
- **Adatok:** User, időpont, utasszám

#### FR-WAIT-002: Automatikus Értesítés
- **Trigger:** Időpont felszabadulása (booked → available)
- **Művelet:** Értesítés küldése várólistán lévőknek

### 3.9 Ajándékutalvány Rendszer

#### FR-VOUCH-001: Utalvány Vásárlás
- **Jogosult:** Bejelentkezett User
- **Mezők:** Címzett neve, email, személyes üzenet
- **Generált:** Egyedi utalványkód

#### FR-VOUCH-002: Utalvány Beváltás
- **Helyszín:** Foglalási folyamat checkout
- **Validáció:** Kód érvényesség, lejárat, státusz

---

## 4. Nem-Funkcionális Követelmények

### 4.1 Biztonság

#### NFR-SEC-001: Row Level Security (RLS)
- Minden tábla RLS-sel védett
- Adathozzáférés szerepkör és tenant alapján korlátozva

#### NFR-SEC-002: Jelszó Biztonság
- Erős jelszó követelmények minden szerepkörre
- Jelszavak hash-elve tárolva (Supabase Auth)

#### NFR-SEC-003: Session Kezelés
- JWT token alapú autentikáció
- Automatikus token frissítés
- Perzisztens session (localStorage)

### 4.2 Teljesítmény

#### NFR-PERF-001: Válaszidő
- Oldalbetöltés: < 3 másodperc
- API válasz: < 500ms

#### NFR-PERF-002: Skálázhatóság
- Multi-tenant architektúra
- Adatbázis indexek optimalizálva

### 4.3 Használhatóság

#### NFR-USE-001: Reszponzív Design
- Mobile-first megközelítés
- Támogatott: mobil, tablet, desktop

#### NFR-USE-002: Többnyelvűség
- Alapértelmezett: Magyar
- Támogatott: Angol
- Nyelv váltás: Minden oldalon elérhető

### 4.4 Elérhetőség

#### NFR-AVAIL-001: Rendelkezésre Állás
- Cél: 99.9% uptime
- Platform: Lovable Cloud (Supabase backend)

---

## 5. Rendszer Korlátozások

### 5.1 Technológiai Korlátozások
- Frontend: React alapú SPA (Single Page Application)
- Backend: Supabase (PostgreSQL + Edge Functions)
- Nincs natív mobil alkalmazás támogatás
- Nincs Angular, Vue, Next.js támogatás

### 5.2 Üzleti Korlátozások
- Előfizetés nélkül nem publikálhatók csomagok
- Lejárt előfizetés esetén foglalások letiltva
- Elutasított regisztráció után 24 óra várakozás kötelező

---

## 6. Elfogadási Kritériumok

### 6.1 Funkcionális Tesztek
- [ ] Minden szerepkör képes bejelentkezni
- [ ] Előfizetők létrehozhatók és kezelhetők
- [ ] Repülőcsomagok CRUD műveletek működnek
- [ ] Foglalási folyamat végigvihető
- [ ] Értesítések megjelennek
- [ ] Kuponok beválthatók

### 6.2 Biztonsági Tesztek
- [ ] RLS szabályok megfelelően szűrnek
- [ ] Jogosulatlan hozzáférés tiltva
- [ ] Jelszó követelmények betartatva

### 6.3 Felhasználói Tesztek
- [ ] Mobil eszközön használható
- [ ] Nyelv váltás működik
- [ ] Navigáció intuitív

---

## 7. Függelékek

### 7.1 Szójegyzék

| Kifejezés | Definíció |
|-----------|-----------|
| Előfizető (Subscriber) | Sétarepülési szolgáltató cég |
| Operátor | Az előfizető alkalmazottja |
| Tenant | Elkülönített adattér egy előfizető számára |
| RLS | Row Level Security - sorszintű biztonsági szabályok |
| Time Slot | Foglalható időpont |
| Flight Package | Repülőcsomag |

### 7.2 Hivatkozások

- Eredeti weboldal: http://varigyula.hu/
- Supabase dokumentáció: https://supabase.com/docs
- React dokumentáció: https://react.dev/
