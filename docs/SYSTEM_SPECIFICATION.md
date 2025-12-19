# Részletes Rendszer Specifikáció

## Vári Gyula Sétarepülés Platform

**Verzió:** 1.1  
**Dátum:** 2024-12-19

---

## 1. Rendszer Architektúra

### 1.1 Technológiai Stack

| Réteg | Technológia | Verzió |
|-------|-------------|--------|
| Frontend Framework | React | ^18.3.1 |
| Build Tool | Vite | Latest |
| Styling | Tailwind CSS | Latest |
| Nyelv | TypeScript | Latest |
| State Management | TanStack Query | ^5.83.0 |
| Routing | React Router DOM | ^6.30.1 |
| UI Komponensek | shadcn/ui (Radix) | Latest |
| Backend | Supabase (Lovable Cloud) | Latest |
| Adatbázis | PostgreSQL | 15+ |

### 1.2 Architektúra Rétegek

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  React Components, Pages, Layouts, UI Elements          │
├─────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT                      │
│  React Context (Auth, Language), TanStack Query Cache   │
├─────────────────────────────────────────────────────────┤
│                    DATA ACCESS LAYER                     │
│  Custom Hooks (useBookings, useTimeSlots, etc.)         │
├─────────────────────────────────────────────────────────┤
│                    API INTEGRATION                       │
│  Supabase Client (@supabase/supabase-js)                │
├─────────────────────────────────────────────────────────┤
│                    BACKEND SERVICES                      │
│  Supabase Auth, Database, Edge Functions, Storage       │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                            │
│  PostgreSQL with RLS Policies                           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architektúra

### 2.1 Projekt Struktúra

```
src/
├── assets/                    # Statikus képek és média
├── components/
│   ├── auth/                  # Autentikációs komponensek
│   │   ├── AdminProtectedRoute.tsx
│   │   ├── OperatorProtectedRoute.tsx
│   │   ├── UserProtectedRoute.tsx
│   │   ├── PasswordGenerator.tsx
│   │   └── PasswordStrengthIndicator.tsx
│   ├── booking/               # Foglalási komponensek
│   │   ├── BookingCard.tsx
│   │   ├── CouponInput.tsx
│   │   ├── PriceBreakdown.tsx
│   │   └── WaitingListButton.tsx
│   ├── layouts/               # Layout komponensek
│   │   ├── PublicLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── notifications/         # Értesítési komponensek
│   │   ├── NotificationBell.tsx
│   │   └── NotificationList.tsx
│   ├── scheduling/            # Időpont kezelő komponensek
│   │   ├── CreateTimeSlotDialog.tsx
│   │   ├── MonthlyCalendar.tsx
│   │   ├── TimeSlotCard.tsx
│   │   └── WeeklyCalendar.tsx
│   ├── subscription/          # Előfizetés komponensek
│   │   └── SubscriptionStatusBadge.tsx
│   ├── ui/                    # shadcn/ui komponensek
│   └── vouchers/              # Utalvány komponensek
│       └── VoucherCard.tsx
├── contexts/
│   ├── AuthContext.tsx        # Autentikáció context
│   └── LanguageContext.tsx    # Többnyelvűség context
├── hooks/                     # Custom React hooks
│   ├── useBookings.ts
│   ├── useNotifications.ts
│   ├── useOperatorAnalytics.ts
│   ├── usePricing.ts
│   ├── usePricingAdmin.ts
│   ├── useSubscription.ts
│   ├── useTimeSlots.ts
│   ├── useVouchers.ts
│   └── useWaitingList.ts
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase kliens (auto-generated)
│       └── types.ts           # TypeScript típusok (auto-generated)
├── lib/                       # Utility funkciók
│   ├── identifierUtils.ts
│   ├── passwordValidation.ts
│   └── utils.ts
├── pages/                     # Oldal komponensek
│   ├── admin/                 # Super Admin oldalak
│   ├── auth/                  # Bejelentkezés/Regisztráció
│   ├── booking/               # Foglalási folyamat
│   ├── dashboard/             # User dashboard
│   ├── operator/              # Operátor oldalak
│   └── public/                # Publikus oldalak
├── types/                     # TypeScript típus definíciók
├── App.tsx                    # Fő alkalmazás és routing
├── main.tsx                   # Belépési pont
└── index.css                  # Globális stílusok
```

### 2.2 Context Providers

#### AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isBootstrapUser: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

**Felelősségek:**
- Session kezelés (persist, refresh)
- Felhasználói adatok betöltése (profile, role)
- Bejelentkezés/Kijelentkezés műveletek
- Bootstrap felhasználó detektálás

#### LanguageContext

```typescript
interface LanguageContextType {
  language: 'hu' | 'en';
  setLanguage: (lang: 'hu' | 'en') => void;
  t: (key: string) => string;
}
```

**Felelősségek:**
- Aktuális nyelv tárolása
- Fordítási funkció biztosítása
- Nyelv váltás kezelése

### 2.3 Routing Struktúra

#### Publikus Útvonalak
| Útvonal | Komponens | Leírás |
|---------|-----------|--------|
| `/` | Index | Főoldal |
| `/hirek` | Hirek | Hírek és információk |
| `/rolam` | Rolam | Rólam oldal |
| `/belepes` | Login | Bejelentkezés |
| `/regisztracio` | Register | Regisztráció |
| `/elerheto-idopontok` | AvailabilityCalendar | Publikus naptár |

#### Védett Útvonalak - User Dashboard
| Útvonal | Komponens | Védelem |
|---------|-----------|---------|
| `/dashboard` | UserDashboard | UserProtectedRoute |
| `/dashboard/foglalasaim` | UserBookingsPage | UserProtectedRoute |
| `/dashboard/kedvencek` | UserFavorites | UserProtectedRoute |
| `/dashboard/utalvanyok` | UserVouchers | UserProtectedRoute |
| `/dashboard/beallitasok` | UserSettings | UserProtectedRoute |

#### Védett Útvonalak - Operator
| Útvonal | Komponens | Védelem |
|---------|-----------|---------|
| `/operator` | OperatorDashboard | OperatorProtectedRoute |
| `/operator/naptar` | OperatorCalendar | OperatorProtectedRoute |
| `/operator/jaratok` | OperatorFlights | OperatorProtectedRoute |
| `/operator/foglalasok` | OperatorBookings | OperatorProtectedRoute |
| `/operator/arak` | OperatorPricing | OperatorProtectedRoute |
| `/operator/analitika` | OperatorAnalytics | OperatorProtectedRoute |
| `/operator/munkatarsak` | OperatorStaff | OperatorProtectedRoute |
| `/operator/szamlazas` | OperatorBilling | OperatorProtectedRoute |
| `/operator/beallitasok` | OperatorSettings | OperatorProtectedRoute |

#### Védett Útvonalak - Admin
| Útvonal | Komponens | Védelem |
|---------|-----------|---------|
| `/admin` | AdminDashboard | AdminProtectedRoute |
| `/admin/elofizetok` | AdminSubscribers | AdminProtectedRoute |
| `/admin/operatorok` | AdminOperators | AdminProtectedRoute |
| `/admin/felhasznalok` | AdminUsers | AdminProtectedRoute |
| `/admin/analitika` | AdminAnalytics | AdminProtectedRoute |
| `/admin/beallitasok` | AdminSettings | AdminProtectedRoute |

### 2.4 Védett Útvonal Komponensek

#### AdminProtectedRoute
```typescript
// Ellenőrzések:
// 1. isLoading → Loading spinner
// 2. !user → Redirect: /admin/login
// 3. userRole.role !== 'super_admin' → Redirect: /
// 4. OK → Render: <Outlet />
```

#### OperatorProtectedRoute
```typescript
// Ellenőrzések:
// 1. isLoading → Loading spinner
// 2. !user → Redirect: /belepes
// 3. role !== 'operator_admin' && role !== 'operator_staff' → Redirect: /
// 4. OK → Render: <Outlet />
```

#### UserProtectedRoute
```typescript
// Ellenőrzések:
// 1. isLoading → Loading spinner
// 2. !user → Redirect: /belepes
// 3. profile.status !== 'active' → Redirect: /
// 4. OK → Render: <Outlet />
```

---

## 3. Backend Architektúra

### 3.1 Supabase Szolgáltatások

| Szolgáltatás | Használat |
|--------------|-----------|
| Auth | Felhasználó autentikáció, session kezelés |
| Database | PostgreSQL adatbázis RLS-sel |
| Edge Functions | Háttérfeldolgozás (emlékeztetők) |
| Realtime | Valós idejű frissítések (opcionális) |

### 3.2 Adatbázis Funkciók

#### has_role(_user_id, _role)
```sql
-- Ellenőrzi, hogy a felhasználónak van-e adott szerepköre
RETURNS boolean
SECURITY DEFINER
```

#### get_user_operator_id(_user_id)
```sql
-- Visszaadja a felhasználó operator_id-ját
RETURNS uuid
SECURITY DEFINER
```

#### is_operator_subscription_active(_operator_id)
```sql
-- Ellenőrzi az előfizetés érvényességét
-- Feltételek: status IN ('active', 'trial') AND expires_at > now()
RETURNS boolean
SECURITY DEFINER
```

#### check_super_admin_exists()
```sql
-- Ellenőrzi, hogy létezik-e Super Admin
-- Bootstrap inicializáláshoz használva
RETURNS boolean
```

#### create_first_super_admin(_user_id, _full_name, _phone)
```sql
-- Első Super Admin létrehozása
-- Csak ha még nincs Super Admin
RETURNS boolean
SECURITY DEFINER
```

#### update_slot_passengers()
```sql
-- Trigger: Foglalás után utasszám frissítése
-- Automatikus státuszváltás (available → booked)
RETURNS trigger
SECURITY DEFINER
```

#### create_booking_notification()
```sql
-- Trigger: Értesítés létrehozása foglalás eseményeknél
RETURNS trigger
SECURITY DEFINER
```

#### create_booking_reminders()
```sql
-- Trigger: Emlékeztető időpontok létrehozása
-- 24 óra és 1 hét előtt
RETURNS trigger
SECURITY DEFINER
```

#### notify_waiting_list()
```sql
-- Trigger: Várólista értesítése időpont felszabadulásakor
RETURNS trigger
SECURITY DEFINER
```

#### notify_profile_status_change()
```sql
-- Trigger: Értesítés profil státusz változáskor
RETURNS trigger
SECURITY DEFINER
```

### 3.3 Edge Functions

#### process-reminders
```typescript
// Cél: Esedékes emlékeztetők feldolgozása
// Trigger: Cron job vagy manuális hívás
// Művelet: 
//   1. Lekéri az el nem küldött, esedékes emlékeztetőket
//   2. Értesítéseket hoz létre
//   3. Megjelöli elküldöttként
```

#### check-subscription-expiry
```typescript
// Cél: Előfizetés lejárat ellenőrzése és email értesítés
// Trigger: Napi cron job (8:00 UTC) - pg_cron
// Email: Resend.com integráció
// Művelet:
//   1. Lekéri az operátorokat, akik lejárata 7 napon belüli
//   2. Email értesítést küld a billing_email címre (7, 3, 1 nap, lejáratkor)
//   3. Lejárt előfizetés esetén státusz → expired
```

### 3.4 Adatbázis Bővítmények

| Extension | Schema | Leírás |
|-----------|--------|--------|
| `pg_cron` | extensions | Ütemezett SQL feladatok futtatása |
| `pg_net` | extensions | HTTP kérések küldése az adatbázisból |

**Cron Job-ok:**

| Név | Ütemezés | Leírás |
|-----|----------|--------|
| `check-subscription-expiry-daily` | `0 8 * * *` | Előfizetés lejárat ellenőrzés |

---

## 4. Adatfolyamok

### 4.1 Regisztrációs Folyamat

```
User Input → signUp() → Supabase Auth → Profile Create → Role Create
     ↓
   Email/Password         auth.users      profiles        user_roles
   Full Name                              (pending)       (user role)
   Phone
```

### 4.2 Bejelentkezési Folyamat

```
Identifier → normalizeIdentifier() → signIn() → fetchUserData() → Redirect
    ↓              ↓                    ↓             ↓
 username    username@admin.internal  session    profile + role
   OR                                             
  email                              
```

### 4.3 Foglalási Folyamat

```
Package Select → Slot Select → Passenger Details → Checkout → Booking Created
      ↓              ↓               ↓                ↓            ↓
 flight_packages  time_slots    passenger_details  price calc   bookings
                                                   + coupons    + notifications
                                                                + reminders
```

### 4.4 Előfizetés Ellenőrzés

```
User Request → RLS Policy → is_operator_subscription_active() → Allow/Deny
                   ↓                      ↓
              operators table     status + expires_at check
```

---

## 5. Biztonsági Architektúra

### 5.1 RLS Policy Struktúra

Minden tábla a következő RLS mintát követi:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (/* feltétel */);

-- INSERT policy
CREATE POLICY "policy_name" ON table_name
  FOR INSERT
  WITH CHECK (/* feltétel */);

-- UPDATE policy
CREATE POLICY "policy_name" ON table_name
  FOR UPDATE
  USING (/* feltétel */);

-- DELETE policy (ha engedélyezett)
CREATE POLICY "policy_name" ON table_name
  FOR DELETE
  USING (/* feltétel */);
```

### 5.2 Multi-Tenant Izoláció

```
Tenant Isolation Strategy:
├── Operator-level data (flight_packages, time_slots, etc.)
│   └── RLS: operator_id = get_user_operator_id(auth.uid())
├── User-level data (bookings, notifications, etc.)
│   └── RLS: user_id = auth.uid()
└── Cross-tenant data (operators)
    └── RLS: has_role(auth.uid(), 'super_admin')
```

### 5.3 Jogosultság Hierarchia

```
super_admin
    ├── Minden művelet minden táblán
    ├── Operátorok kezelése
    └── Előfizetések kezelése

operator_admin
    ├── Saját operator összes adata
    ├── Csomagok, időpontok CRUD
    ├── Foglalások kezelése
    └── Staff létrehozása

operator_staff
    ├── Saját operator adatainak olvasása
    └── Felhasználók jóváhagyása (ha engedélyezett)

user
    ├── Saját adatok olvasása/írása
    ├── Publikus adatok olvasása
    └── Foglalás létrehozása (ha aktív)
```

---

## 6. Integrációk

### 6.1 Supabase Client

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 6.2 Környezeti Változók

| Változó | Leírás |
|---------|--------|
| VITE_SUPABASE_URL | Supabase projekt URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Publikus API kulcs |
| VITE_SUPABASE_PROJECT_ID | Projekt azonosító |

---

## 7. Hibakezelés

### 7.1 Frontend Hibakezelés

```typescript
// Toast értesítések használata
import { toast } from "sonner";

try {
  // művelet
} catch (error) {
  toast.error("Hiba történt", {
    description: error.message
  });
}
```

### 7.2 API Hibakezelés

```typescript
const { data, error } = await supabase.from('table').select();

if (error) {
  console.error('Database error:', error);
  throw error;
}
```

---

## 8. Teljesítmény Optimalizációk

### 8.1 Query Caching

```typescript
// TanStack Query használata
const { data, isLoading } = useQuery({
  queryKey: ['bookings', userId],
  queryFn: fetchBookings,
  staleTime: 5 * 60 * 1000, // 5 perc
});
```

### 8.2 Lazy Loading

```typescript
// React lazy import
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
```

### 8.3 Adatbázis Indexek

- Elsődleges kulcsok: UUID automatikus index
- Idegen kulcsok: Automatikus index
- Gyakran szűrt oszlopok: Manuális index (status, operator_id, user_id)
