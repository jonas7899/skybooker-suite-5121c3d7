# Üzemeltetési és Monitoring Dokumentáció

## Vári Gyula Sétarepülés Platform

**Verzió:** 1.1  
**Dátum:** 2024-12-19

---

## 1. Infrastruktúra Áttekintés

### 1.1 Platform Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                      LOVABLE CLOUD                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │   Frontend      │  │         Supabase                │   │
│  │   (Vite/React)  │  │  ┌─────────────────────────┐   │   │
│  │                 │  │  │ PostgreSQL Database     │   │   │
│  │  - Static files │  │  │ - Tables with RLS       │   │   │
│  │  - SPA routing  │  │  │ - Functions/Triggers    │   │   │
│  │                 │  │  └─────────────────────────┘   │   │
│  │                 │  │  ┌─────────────────────────┐   │   │
│  │                 │  │  │ Auth Service            │   │   │
│  │                 │  │  │ - JWT tokens            │   │   │
│  │                 │  │  │ - Session management    │   │   │
│  │                 │  │  └─────────────────────────┘   │   │
│  │                 │  │  ┌─────────────────────────┐   │   │
│  │                 │  │  │ Edge Functions          │   │   │
│  │                 │  │  │ - process-reminders     │   │   │
│  │                 │  │  │ - check-subscription-   │   │   │
│  │                 │  │  │   expiry                │   │   │
│  │                 │  │  └─────────────────────────┘   │   │
│  │                 │  │  ┌─────────────────────────┐   │   │
│  │                 │  │  │ Cron Jobs (pg_cron)     │   │   │
│  │                 │  │  │ - subscription-expiry   │   │   │
│  │                 │  │  │   (daily 8:00 UTC)      │   │   │
│  │                 │  │  └─────────────────────────┘   │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Szolgáltatások

| Szolgáltatás | Leírás | Elérhetőség |
|--------------|--------|-------------|
| Frontend | React SPA | Lovable hosting |
| Database | PostgreSQL 15+ | Supabase managed |
| Auth | JWT-based | Supabase Auth |
| Edge Functions | Deno runtime | Supabase Functions |

---

## 2. Deployment Folyamat

### 2.1 Automatikus Deploy

A Lovable platform automatikusan deployol minden változtatás után:

1. **Kód mentés** → Lovable editor
2. **Build** → Vite production build
3. **Deploy** → CDN distribution
4. **Edge Functions** → Automatikus frissítés

### 2.2 Deploy Ellenőrzés

```bash
# Build kimenet ellenőrzése
# A Lovable preview automatikusan frissül

# Edge Function deployment ellenőrzés
# Supabase dashboard → Edge Functions → Logs
```

### 2.3 Rollback

Lovable verziókezelést használ - korábbi verzióra visszaállítás:
1. Lovable editor → History
2. Válassza ki a kívánt verziót
3. Restore

---

## 3. Környezeti Változók

### 3.1 Automatikusan Beállított

| Változó | Leírás | Szerkeszthető |
|---------|--------|---------------|
| VITE_SUPABASE_URL | Supabase projekt URL | Nem |
| VITE_SUPABASE_PUBLISHABLE_KEY | Anon API kulcs | Nem |
| VITE_SUPABASE_PROJECT_ID | Projekt azonosító | Nem |

### 3.2 Edge Function Secrets

| Secret | Leírás | Elérés |
|--------|--------|--------|
| SUPABASE_URL | Projekt URL | Deno.env.get() |
| SUPABASE_ANON_KEY | Anon kulcs | Deno.env.get() |
| SUPABASE_SERVICE_ROLE_KEY | Admin kulcs | Deno.env.get() |
| SUPABASE_DB_URL | Közvetlen DB URL | Deno.env.get() |
| RESEND_API_KEY | Resend email API kulcs | Deno.env.get() |

---

## 3.3 Automatikus Ütemezett Feladatok

### check-subscription-expiry-daily

**Leírás:** Előfizetés lejárat ellenőrzés és email értesítés küldése.

| Tulajdonság | Érték |
|-------------|-------|
| Cron Job Név | `check-subscription-expiry-daily` |
| Ütemezés | `0 8 * * *` (naponta 8:00 UTC) |
| Edge Function | `check-subscription-expiry` |
| Email Provider | Resend.com |

**Értesítési intervallumok:**
- 7 nappal a lejárat előtt
- 3 nappal a lejárat előtt  
- 1 nappal a lejárat előtt
- Lejáratkor (státusz → expired)

**Monitoring:**
```sql
-- Cron job futás ellenőrzése
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-subscription-expiry-daily')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 4. Monitoring

### 4.1 Frontend Monitoring

**Elérhető metrikák:**
- Oldalbetöltési idő
- Client-side hibák (console)
- React render teljesítmény

**Ellenőrzés:**
```javascript
// Browser DevTools → Performance
// Browser DevTools → Console (hibák)
// React DevTools → Profiler
```

### 4.2 Backend Monitoring

#### Supabase Dashboard Logok

**Auth Logs:**
```sql
SELECT 
  id, 
  auth_logs.timestamp, 
  event_message, 
  metadata.level, 
  metadata.status, 
  metadata.path
FROM auth_logs
CROSS JOIN unnest(metadata) as metadata
ORDER BY timestamp DESC
LIMIT 100
```

**Database Logs:**
```sql
SELECT 
  identifier, 
  postgres_logs.timestamp, 
  event_message, 
  parsed.error_severity 
FROM postgres_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.parsed) as parsed
ORDER BY timestamp DESC
LIMIT 100
```

**Edge Function Logs:**
```sql
SELECT 
  id,
  function_edge_logs.timestamp,
  event_message,
  response.status_code,
  request.method,
  m.function_id,
  m.execution_time_ms
FROM function_edge_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.response) as response
CROSS JOIN unnest(m.request) as request
ORDER BY timestamp DESC
LIMIT 100
```

### 4.3 Riasztások Beállítása

**Javasolt riasztási küszöbök:**

| Metrika | Küszöb | Prioritás |
|---------|--------|-----------|
| Database errors | > 10/perc | Kritikus |
| Auth failures | > 50/óra | Magas |
| Edge function errors | > 5/perc | Magas |
| Response time | > 3 sec | Közepes |
| Failed logins | > 20/óra/IP | Közepes |

---

## 5. Biztonsági Beállítások

### 5.1 Row Level Security (RLS)

**Ellenőrzési lista:**

- [ ] Minden tábla RLS engedélyezve
- [ ] SELECT policy definiálva
- [ ] INSERT policy definiálva
- [ ] UPDATE policy definiálva
- [ ] DELETE policy definiálva (ahol szükséges)

**RLS ellenőrzés:**
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 5.2 Auth Konfiguráció

**Javasolt beállítások:**

| Beállítás | Érték | Leírás |
|-----------|-------|--------|
| Auto-confirm email | Enabled (dev) | Fejlesztéshez |
| Password min length | 8 | Minimum jelszóhossz |
| JWT expiry | 3600 | Token lejárat (másodperc) |
| Refresh token rotation | Enabled | Biztonsági refresh |

### 5.3 CORS Konfiguráció

Edge Functions CORS beállítás:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 6. Adatbázis Karbantartás

### 6.1 Backup

**Automatikus backup:**
- Supabase Pro: Napi automatikus backup
- Point-in-time recovery: 7 nap

**Manuális export:**
```sql
-- Teljes táblák exportja
-- Supabase Dashboard → Database → Backups
```

### 6.2 Indexek

**Meglévő indexek:**
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Javasolt indexek:**
```sql
-- Gyakran szűrt oszlopok
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON flight_time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON flight_time_slots(status);
```

### 6.3 Vacuum és Analyze

```sql
-- Automatikus (pg_cron vagy external trigger)
VACUUM ANALYZE bookings;
VACUUM ANALYZE flight_time_slots;
VACUUM ANALYZE notifications;
```

---

## 7. Hibaelhárítás

### 7.1 Gyakori Hibák

#### "RLS policy violation"
```
Hiba: new row violates row-level security policy
```
**Megoldás:**
1. Ellenőrizze a felhasználó bejelentkezési státuszát
2. Ellenőrizze a felhasználó szerepkörét
3. Ellenőrizze az RLS policy-t

#### "JWT expired"
```
Hiba: JWT token has expired
```
**Megoldás:**
1. Hívja meg a `supabase.auth.refreshSession()`
2. Ellenőrizze az `autoRefreshToken` beállítást

#### "Foreign key violation"
```
Hiba: violates foreign key constraint
```
**Megoldás:**
1. Ellenőrizze a hivatkozott rekord létezését
2. Ellenőrizze a törlési sorrendet

### 7.2 Debug Parancsok

**Felhasználó szerepkör ellenőrzése:**
```sql
SELECT 
  p.full_name,
  p.status,
  ur.role,
  ur.operator_id
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.id = 'user-uuid-here';
```

**Előfizetés állapot ellenőrzése:**
```sql
SELECT 
  name,
  subscription_status,
  subscription_expires_at,
  is_operator_subscription_active(id) as is_active
FROM operators
WHERE id = 'operator-uuid-here';
```

**Foglalás és kapcsolódó adatok:**
```sql
SELECT 
  b.*,
  fp.name as package_name,
  fts.slot_date,
  fts.start_time
FROM bookings b
JOIN flight_packages fp ON b.flight_package_id = fp.id
JOIN flight_time_slots fts ON b.time_slot_id = fts.id
WHERE b.id = 'booking-uuid-here';
```

### 7.3 Log Keresés

**Auth hibák:**
```sql
SELECT * FROM auth_logs
WHERE event_message LIKE '%error%'
ORDER BY timestamp DESC
LIMIT 50;
```

**Database hibák:**
```sql
SELECT * FROM postgres_logs
WHERE parsed.error_severity = 'ERROR'
ORDER BY timestamp DESC
LIMIT 50;
```

---

## 8. Teljesítmény Optimalizálás

### 8.1 Query Optimalizálás

**Lassú query-k azonosítása:**
```sql
SELECT
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### 8.2 Cache Beállítások

**TanStack Query:**
```typescript
// Ajánlott staleTime értékek
const queryConfig = {
  staleTime: 5 * 60 * 1000,  // 5 perc statikus adatokhoz
  cacheTime: 30 * 60 * 1000, // 30 perc cache
  refetchOnWindowFocus: false,
};
```

### 8.3 CDN és Asset Optimalizálás

- Statikus fájlok: Lovable CDN automatikus
- Képek: Megfelelő méret és formátum
- Code splitting: Lazy loading routes

---

## 9. Skálázási Megfontolások

### 9.1 Jelenlegi Korlátok

| Erőforrás | Limit | Típus |
|-----------|-------|-------|
| Database connections | 60 (free) / 500 (pro) | Supabase |
| Storage | 1GB (free) / 8GB+ (pro) | Supabase |
| Edge Function timeout | 60 sec | Supabase |
| API requests | 500K/hó (free) | Supabase |

### 9.2 Skálázási Opciók

**Horizontális skálázás:**
- Read replicas (Pro terv)
- Connection pooling (PgBouncer)

**Vertikális skálázás:**
- Supabase Pro/Team terv
- Dedikált resources

---

## 10. Disaster Recovery

### 10.1 Backup Stratégia

| Típus | Gyakoriság | Megőrzés |
|-------|------------|----------|
| Automatic backup | Naponta | 7 nap |
| Point-in-time | Folyamatos | 7 nap |
| Manual export | Heti | 30 nap |

### 10.2 Recovery Folyamat

1. **Adatvesztés azonosítása**
2. **Recovery pont kiválasztása**
3. **Supabase Dashboard → Database → Backups**
4. **Restore végrehajtása**
5. **Integritás ellenőrzése**
6. **Szolgáltatás újraindítása**

### 10.3 Kommunikációs Terv

| Esemény | Értesítendők | Csatorna |
|---------|--------------|----------|
| Planned maintenance | Minden felhasználó | In-app banner |
| Unplanned outage | Admin, Operátorok | Email + In-app |
| Data incident | Érintett felhasználók | Email |

---

## 11. Compliance és Adatvédelem

### 11.1 GDPR Megfelelés

**Személyes adatok kezelése:**
- Felhasználói hozzájárulás: Regisztrációkor
- Adattárolás helye: EU (Supabase EU region)
- Adatmegőrzés: Aktív fiók + 2 év inaktivitás után törlés

**Adatalany jogok:**
- Hozzáférés: User dashboard
- Törlés: Fiók törlés funkció
- Export: Adatok letöltése

### 11.2 Audit Log

```sql
-- Fontos műveletek naplózása
-- Beépített Supabase audit log használata
SELECT * FROM auth.audit_log_entries
ORDER BY created_at DESC
LIMIT 100;
```

---

## 12. Kapcsolat és Eszkaláció

### 12.1 Támogatási Szintek

| Szint | Probléma típus | Válaszidő |
|-------|----------------|-----------|
| L1 | Általános kérdések | 24 óra |
| L2 | Technikai problémák | 4 óra |
| L3 | Kritikus leállás | 1 óra |

### 12.2 Eszkaláció

```
L1 Support
    ↓
L2 Technical Team
    ↓
L3 Platform Admin (Super Admin)
    ↓
Lovable Support (platform issues)
    ↓
Supabase Support (backend issues)
```

---

## 13. Karbantartási Ütemterv

### 13.1 Napi Feladatok

- [ ] Error log ellenőrzés
- [ ] Auth log ellenőrzés
- [ ] Aktív session-ök száma

### 13.2 Heti Feladatok

- [ ] Teljesítmény metrikák áttekintése
- [ ] Database méret ellenőrzés
- [ ] Failed login-ok vizsgálata

### 13.3 Havi Feladatok

- [ ] RLS policy audit
- [ ] Backup restore teszt
- [ ] Dependency frissítések
- [ ] Security patch-ek

### 13.4 Negyedéves Feladatok

- [ ] Teljes biztonsági audit
- [ ] Disaster recovery teszt
- [ ] Kapacitás tervezés
- [ ] Dokumentáció frissítés
