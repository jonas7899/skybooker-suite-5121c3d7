# API Dokumentáció

## Vári Gyula Sétarepülés Platform

**Verzió:** 1.1  
**Dátum:** 2024-12-19

---

## 1. Áttekintés

A platform Supabase-t használ backendként, amely automatikusan generál REST és Realtime API-t a PostgreSQL adatbázis alapján. Az API hozzáférés Row Level Security (RLS) szabályokkal védett.

### 1.1 Alap URL

```
https://jeoegtzuubcrauhkuhlz.supabase.co
```

### 1.2 Autentikáció

Minden API kéréshez szükséges:
- `apikey` header: Supabase anon key
- `Authorization` header: `Bearer <access_token>` (bejelentkezett felhasználóknak)

---

## 2. Adatbázis Táblák

### 2.1 operators (Előfizetők)

**Leírás:** Sétarepülési szolgáltatók (előfizetők) adatai.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| name | text | No | - | Előfizető neve |
| slug | text | No | - | URL-barát azonosító |
| subscription_status | text | No | 'trial' | Előfizetés státusza |
| subscription_plan | text | Yes | 'monthly' | Előfizetési csomag |
| subscription_price_huf | integer | Yes | 9999 | Havi díj (HUF) |
| subscription_started_at | timestamptz | Yes | - | Kezdés dátuma |
| subscription_expires_at | timestamptz | Yes | - | Lejárat dátuma |
| billing_email | text | Yes | - | Számlázási email |
| billing_name | text | Yes | - | Számlázási név |
| created_at | timestamptz | No | now() | Létrehozás ideje |

**RLS Szabályok:**

```sql
-- Bárki láthatja az aktív előfizetőket
CREATE POLICY "Anyone can view active operators" ON operators
  FOR SELECT USING (subscription_status IN ('active', 'trial'));

-- Super Admin teljes hozzáférés
CREATE POLICY "Super admins can manage operators" ON operators
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));
```

---

### 2.2 profiles (Felhasználói Profilok)

**Leírás:** Felhasználók profil adatai.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | - | Elsődleges kulcs (auth.users.id) |
| full_name | text | No | - | Teljes név |
| phone | text | Yes | - | Telefonszám |
| status | profile_status | No | 'pending' | Profil státusz |
| is_bootstrap | boolean | No | false | Bootstrap felhasználó flag |
| rejected_until | timestamptz | Yes | - | Újra-regisztráció időpontja |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

**Profile Status Enum:**
```sql
CREATE TYPE profile_status AS ENUM (
  'bootstrap',   -- Kezdeti Super Admin
  'pending',     -- Jóváhagyásra vár
  'active',      -- Aktív
  'rejected',    -- Elutasított
  'inactive',    -- Inaktív
  'suspended'    -- Felfüggesztett
);
```

**RLS Szabályok:**

```sql
-- Saját profil megtekintése
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Saját profil módosítása
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin látja az összes profilt
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'operator_admin') OR
    has_role(auth.uid(), 'operator_staff')
  );
```

---

### 2.3 user_roles (Felhasználói Szerepkörök)

**Leírás:** Felhasználó-szerepkör összerendelések.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| user_id | uuid | No | - | Felhasználó ID |
| role | app_role | No | - | Szerepkör |
| operator_id | uuid | Yes | - | Előfizető ID (ha van) |
| approved_by | uuid | Yes | - | Jóváhagyó ID |
| approved_at | timestamptz | Yes | - | Jóváhagyás ideje |
| rejected_at | timestamptz | Yes | - | Elutasítás ideje |
| rejection_reason | text | Yes | - | Elutasítás oka |
| created_at | timestamptz | No | now() | Létrehozás ideje |

**App Role Enum:**
```sql
CREATE TYPE app_role AS ENUM (
  'super_admin',     -- Platform adminisztrátor
  'operator_admin',  -- Előfizető adminisztrátor
  'operator_staff',  -- Előfizető munkatárs
  'user'             -- Regisztrált ügyfél
);
```

---

### 2.4 flight_packages (Repülőcsomagok)

**Leírás:** Foglalható repülőcsomagok.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| operator_id | uuid | No | - | Előfizető ID |
| name | text | No | - | Csomag neve |
| short_description | text | Yes | - | Rövid leírás |
| detailed_description | text | Yes | - | Részletes leírás |
| route_description | text | Yes | - | Útvonal leírás |
| duration_minutes | integer | No | 30 | Időtartam (perc) |
| difficulty_level | text | No | 'easy' | Nehézségi szint |
| recommended_audience | text | Yes | - | Ajánlott közönség |
| base_price_huf | integer | No | - | Alapár (HUF) |
| max_passengers | integer | No | 1 | Max. utasszám |
| is_active | boolean | No | true | Aktív flag |
| image_url | text | Yes | - | Kép URL |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

**RLS Szabályok:**

```sql
-- Aktív csomagok láthatók (ha előfizetés aktív)
CREATE POLICY "Anyone can view active flight packages with valid subscription"
  ON flight_packages FOR SELECT
  USING (is_active = true AND is_operator_subscription_active(operator_id));

-- Operator Admin teljes kezelés
CREATE POLICY "Operator admins can manage their packages"
  ON flight_packages FOR ALL
  USING (
    has_role(auth.uid(), 'operator_admin') AND
    operator_id = get_user_operator_id(auth.uid())
  );
```

---

### 2.5 flight_time_slots (Időpontok)

**Leírás:** Foglalható időpontok.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| operator_id | uuid | No | - | Előfizető ID |
| flight_package_id | uuid | Yes | - | Csomag ID (opcionális) |
| slot_date | date | No | - | Dátum |
| start_time | time | No | - | Kezdési idő |
| duration_minutes | integer | No | 30 | Időtartam |
| max_passengers | integer | No | 1 | Max. utasszám |
| current_passengers | integer | No | 0 | Jelenlegi utasszám |
| status | time_slot_status | No | 'available' | Státusz |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

**Time Slot Status Enum:**
```sql
CREATE TYPE time_slot_status AS ENUM (
  'available',  -- Foglalható
  'booked',     -- Teljesen lefoglalt
  'closed'      -- Lezárt
);
```

---

### 2.6 bookings (Foglalások)

**Leírás:** Repülési foglalások.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| user_id | uuid | No | - | Foglaló felhasználó ID |
| flight_package_id | uuid | No | - | Csomag ID |
| time_slot_id | uuid | No | - | Időpont ID |
| passenger_count | integer | No | 1 | Utasok száma |
| passenger_details | jsonb | Yes | - | Utas adatok |
| total_price_huf | integer | No | - | Végösszeg (HUF) |
| status | booking_status | No | 'pending' | Státusz |
| notes | text | Yes | - | Megjegyzések |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

**Booking Status Enum:**
```sql
CREATE TYPE booking_status AS ENUM (
  'pending',    -- Jóváhagyásra vár
  'confirmed',  -- Megerősített
  'cancelled'   -- Lemondott
);
```

**passenger_details JSON struktúra:**
```json
[
  {
    "name": "Kovács János",
    "weight": 80,
    "age": 35
  }
]
```

---

### 2.7 notifications (Értesítések)

**Leírás:** In-app értesítések.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| user_id | uuid | No | - | Címzett ID |
| title | text | No | - | Értesítés címe |
| message | text | No | - | Üzenet szövege |
| type | text | No | 'info' | Értesítés típusa |
| is_read | boolean | No | false | Olvasott flag |
| related_booking_id | uuid | Yes | - | Kapcsolódó foglalás |
| created_at | timestamptz | No | now() | Létrehozás ideje |

**Értesítés típusok:**
- `info` - Általános információ
- `booking_created` - Foglalás létrehozva
- `booking_confirmed` - Foglalás megerősítve
- `booking_cancelled` - Foglalás lemondva
- `account_activated` - Fiók aktiválva
- `account_rejected` - Regisztráció elutasítva
- `account_suspended` - Fiók felfüggesztve
- `waiting_list_available` - Időpont felszabadult

---

### 2.8 booking_reminders (Emlékeztetők)

**Leírás:** Automatikus foglalási emlékeztetők.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| booking_id | uuid | No | - | Foglalás ID |
| reminder_type | text | No | - | Emlékeztető típusa |
| scheduled_for | timestamptz | No | - | Ütemezett időpont |
| sent | boolean | No | false | Elküldve flag |
| sent_at | timestamptz | Yes | - | Küldés időpontja |
| created_at | timestamptz | No | now() | Létrehozás ideje |

**Emlékeztető típusok:**
- `24h_before` - 24 órával a repülés előtt
- `1_week_before` - 1 héttel a repülés előtt

---

### 2.9 waiting_list (Várólista)

**Leírás:** Telt házas időpontokra jelentkezők.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| user_id | uuid | No | - | Felhasználó ID |
| time_slot_id | uuid | No | - | Időpont ID |
| flight_package_id | uuid | No | - | Csomag ID |
| passenger_count | integer | No | 1 | Kívánt utasszám |
| notified | boolean | No | false | Értesítve flag |
| created_at | timestamptz | No | now() | Létrehozás ideje |

---

### 2.10 gift_vouchers (Ajándékutalványok)

**Leírás:** Vásárolt ajándékutalványok.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| operator_id | uuid | No | - | Előfizető ID |
| purchaser_user_id | uuid | No | - | Vásárló ID |
| flight_package_id | uuid | No | - | Csomag ID |
| voucher_code | text | No | - | Egyedi kód |
| recipient_name | text | No | - | Címzett neve |
| recipient_email | text | Yes | - | Címzett email |
| personal_message | text | Yes | - | Személyes üzenet |
| purchase_price_huf | integer | No | - | Vásárlási ár |
| status | text | No | 'active' | Státusz |
| expires_at | timestamptz | No | - | Lejárati dátum |
| redeemed_at | timestamptz | Yes | - | Beváltás ideje |
| redeemed_booking_id | uuid | Yes | - | Beváltó foglalás |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

---

### 2.11 coupons (Kuponok)

**Leírás:** Kedvezményes kuponkódok.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| operator_id | uuid | No | - | Előfizető ID |
| code | text | No | - | Kuponkód |
| discount_type | discount_type | No | - | Kedvezmény típusa |
| discount_value | integer | No | - | Kedvezmény értéke |
| flight_package_id | uuid | Yes | - | Csomag (ha specifikus) |
| usage_limit | integer | Yes | - | Használati limit |
| times_used | integer | No | 0 | Felhasználások száma |
| expires_at | timestamptz | Yes | - | Lejárati dátum |
| is_active | boolean | No | true | Aktív flag |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

**Discount Type Enum:**
```sql
CREATE TYPE discount_type AS ENUM (
  'percentage',  -- Százalékos
  'fixed'        -- Fix összeg
);
```

---

### 2.12 package_discounts (Csomag Kedvezmények)

**Leírás:** Csomagokhoz rendelt automatikus kedvezmények.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| flight_package_id | uuid | No | - | Csomag ID |
| discount_type | discount_type | No | - | Kedvezmény típusa |
| discount_value | integer | No | - | Kedvezmény értéke |
| condition_type | discount_condition | No | 'always' | Feltétel típusa |
| condition_days | text[] | Yes | - | Napok (ha specifikus) |
| is_active | boolean | No | true | Aktív flag |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

**Discount Condition Enum:**
```sql
CREATE TYPE discount_condition AS ENUM (
  'always',        -- Mindig érvényes
  'weekday',       -- Hétköznap
  'weekend',       -- Hétvége
  'specific_days'  -- Megadott napok
);
```

---

### 2.13 campaigns (Kampányok)

**Leírás:** Időalapú promóciós kampányok.

| Oszlop | Típus | Nullable | Default | Leírás |
|--------|-------|----------|---------|--------|
| id | uuid | No | gen_random_uuid() | Elsődleges kulcs |
| flight_package_id | uuid | No | - | Csomag ID |
| name | text | No | - | Kampány neve |
| discount_type | discount_type | No | - | Kedvezmény típusa |
| discount_value | integer | No | - | Kedvezmény értéke |
| starts_at | timestamptz | No | - | Kezdés ideje |
| ends_at | timestamptz | No | - | Befejezés ideje |
| is_active | boolean | No | true | Aktív flag |
| created_at | timestamptz | No | now() | Létrehozás ideje |
| updated_at | timestamptz | No | now() | Módosítás ideje |

---

## 3. Adatbázis Funkciók

### 3.1 has_role

```sql
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Használat:**
```sql
SELECT has_role(auth.uid(), 'super_admin');
```

---

### 3.2 get_user_operator_id

```sql
CREATE FUNCTION get_user_operator_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT operator_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;
```

---

### 3.3 is_operator_subscription_active

```sql
CREATE FUNCTION is_operator_subscription_active(_operator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.operators
    WHERE id = _operator_id
      AND subscription_status IN ('active', 'trial')
      AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
  )
$$;
```

---

### 3.4 check_super_admin_exists

```sql
CREATE FUNCTION check_super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE role = 'super_admin'
  )
$$;
```

---

### 3.5 create_first_super_admin

```sql
CREATE FUNCTION create_first_super_admin(
  _user_id uuid,
  _full_name text,
  _phone text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _existing_admins int;
BEGIN
  SELECT COUNT(*) INTO _existing_admins
  FROM user_roles WHERE role = 'super_admin';
  
  IF _existing_admins > 0 THEN
    RETURN false;
  END IF;
  
  INSERT INTO profiles (id, full_name, phone, status, is_bootstrap)
  VALUES (_user_id, _full_name, _phone, 'active', false)
  ON CONFLICT (id) DO UPDATE SET
    full_name = _full_name,
    phone = _phone,
    status = 'active',
    is_bootstrap = false;
  
  INSERT INTO user_roles (user_id, role, approved_at)
  VALUES (_user_id, 'super_admin', NOW())
  ON CONFLICT DO NOTHING;
  
  UPDATE profiles
  SET status = 'inactive'
  WHERE is_bootstrap = true AND status = 'bootstrap';
  
  RETURN true;
END;
$$;
```

---

### 3.6 generate_voucher_code

```sql
CREATE FUNCTION generate_voucher_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'VGY-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;
```

**Példa kimenet:** `VGY-A3BK9QW2`

---

## 4. Edge Functions

### 4.1 process-reminders

**Útvonal:** `/functions/v1/process-reminders`  
**Metódus:** POST  
**Autentikáció:** Service role key

**Leírás:** Feldolgozza az esedékes emlékeztetőket és értesítéseket hoz létre.

**Működés:**
1. Lekéri az összes el nem küldött, esedékes emlékeztetőt
2. Minden emlékeztetőhöz értesítést hoz létre
3. Megjelöli az emlékeztetőket elküldöttként

```typescript
// supabase/functions/process-reminders/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: reminders, error } = await supabase
    .from('booking_reminders')
    .select(`
      *,
      bookings (
        user_id,
        flight_packages (name),
        flight_time_slots (slot_date, start_time)
      )
    `)
    .eq('sent', false)
    .lte('scheduled_for', new Date().toISOString())

  // Process reminders...
  
  return new Response(JSON.stringify({ processed: reminders?.length || 0 }))
})
```

---

### 4.2 check-subscription-expiry

**Útvonal:** `/functions/v1/check-subscription-expiry`  
**Metódus:** POST  
**Autentikáció:** Anon key (cron job által hívva)

**Leírás:** Automatikusan ellenőrzi az operátorok előfizetésének lejáratát és email értesítéseket küld.

**Trigger:** Napi cron job (8:00 UTC) - `check-subscription-expiry-daily`

**Működés:**
1. Lekéri az összes aktív/trial előfizetőt, akik lejárata 7 napon belüli
2. Email értesítést küld a `billing_email` címre a következő intervallumokban:
   - **7 nappal a lejárat előtt:** Emlékeztető a közelgő lejáratról
   - **3 nappal a lejárat előtt:** Sürgős emlékeztető
   - **1 nappal a lejárat előtt:** Utolsó emlékeztető
   - **Lejáratkor:** Értesítés a lejárt előfizetésről
3. Lejárt előfizetés esetén a státuszt `expired`-re állítja

**Szükséges Secret:** `RESEND_API_KEY`

```typescript
// supabase/functions/check-subscription-expiry/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Lekéri az operátorokat, akik lejárata 7 napon belüli
  const { data: operators, error } = await supabase
    .from('operators')
    .select('*')
    .in('subscription_status', ['active', 'trial'])
    .not('subscription_expires_at', 'is', null)
    .lte('subscription_expires_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  // Email küldés és státusz frissítés...
  
  return new Response(JSON.stringify({ processed: operators?.length || 0 }));
});
```

---

## 4.3 Adatbázis Bővítmények (Extensions)

A platform a következő PostgreSQL bővítményeket használja:

| Extension | Schema | Leírás |
|-----------|--------|--------|
| `pg_cron` | extensions | Ütemezett feladatok futtatása |
| `pg_net` | extensions | HTTP kérések küldése az adatbázisból |

**pg_cron Konfiguráció:**

```sql
-- Előfizetés lejárat ellenőrzés - naponta 8:00 UTC
SELECT cron.schedule(
  'check-subscription-expiry-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://jeoegtzuubcrauhkuhlz.supabase.co/functions/v1/check-subscription-expiry',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <anon_key>"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

---

## 5. Supabase Client Használat

### 5.1 Inicializálás

```typescript
import { supabase } from "@/integrations/supabase/client";
```

### 5.2 Adatlekérés (SELECT)

```typescript
// Egyszerű lekérés
const { data, error } = await supabase
  .from('flight_packages')
  .select('*')
  .eq('is_active', true);

// Kapcsolt táblákkal
const { data, error } = await supabase
  .from('bookings')
  .select(`
    *,
    flight_packages (name, base_price_huf),
    flight_time_slots (slot_date, start_time)
  `)
  .eq('user_id', userId);
```

### 5.3 Beszúrás (INSERT)

```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    user_id: userId,
    flight_package_id: packageId,
    time_slot_id: slotId,
    passenger_count: 2,
    total_price_huf: 85000
  })
  .select()
  .single();
```

### 5.4 Frissítés (UPDATE)

```typescript
const { error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId);
```

### 5.5 Törlés (DELETE)

```typescript
const { error } = await supabase
  .from('waiting_list')
  .delete()
  .eq('user_id', userId)
  .eq('time_slot_id', slotId);
```

### 5.6 RPC Hívás

```typescript
const { data, error } = await supabase
  .rpc('check_super_admin_exists');
```

### 5.7 Autentikáció

```typescript
// Regisztráció
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// Bejelentkezés
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// Kijelentkezés
await supabase.auth.signOut();

// Session lekérés
const { data: { session } } = await supabase.auth.getSession();
```

---

## 6. Hibakódok

| Kód | Jelentés | Megoldás |
|-----|----------|----------|
| PGRST301 | RLS policy violation | Ellenőrizze a jogosultságokat |
| 23505 | Unique constraint violation | Duplikált adat |
| 23503 | Foreign key violation | Hivatkozott rekord nem létezik |
| 42501 | Insufficient privilege | Nincs jogosultság |
| PGRST116 | Row not found | Nem található a keresett rekord |
