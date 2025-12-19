# Fejlesztői Kézikönyv

## Vári Gyula Sétarepülés Platform

**Verzió:** 1.1  
**Dátum:** 2024-12-19

---

## 1. Fejlesztési Környezet Beállítása

### 1.1 Előfeltételek

| Eszköz | Verzió | Cél |
|--------|--------|-----|
| Node.js | 18+ | JavaScript runtime |
| npm/bun | Latest | Csomagkezelő |
| Git | Latest | Verziókezelés |
| VS Code | Latest | IDE (ajánlott) |

### 1.2 Projekt Klónozása

```bash
# Lovable projekten keresztül automatikus
# Vagy Git klón (ha elérhető)
git clone <repository-url>
cd vari-gyula-platform
```

### 1.3 Függőségek Telepítése

```bash
npm install
# vagy
bun install
```

### 1.4 Fejlesztői Szerver Indítása

```bash
npm run dev
# vagy
bun dev
```

A szerver elérhető: `http://localhost:5173`

---

## 2. Projekt Struktúra

```
├── docs/                      # Dokumentáció
│   ├── diagrams/              # PlantUML diagramok
│   └── *.md                   # Markdown dokumentumok
├── public/                    # Statikus fájlok
├── src/
│   ├── assets/                # Képek, média
│   ├── components/
│   │   ├── auth/              # Autentikációs komponensek
│   │   ├── booking/           # Foglalási komponensek
│   │   ├── layouts/           # Layout komponensek
│   │   ├── notifications/     # Értesítési komponensek
│   │   ├── scheduling/        # Időpont kezelő komponensek
│   │   ├── subscription/      # Előfizetés komponensek
│   │   ├── ui/                # shadcn/ui komponensek
│   │   └── vouchers/          # Utalvány komponensek
│   ├── contexts/              # React Context-ek
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/
│   │   └── supabase/          # Supabase integráció
│   ├── lib/                   # Utility funkciók
│   ├── pages/                 # Oldal komponensek
│   │   ├── admin/             # Admin oldalak
│   │   ├── auth/              # Auth oldalak
│   │   ├── booking/           # Foglalási oldalak
│   │   ├── dashboard/         # User dashboard
│   │   ├── operator/          # Operátor oldalak
│   │   └── public/            # Publikus oldalak
│   ├── types/                 # TypeScript típusok
│   ├── App.tsx                # Fő alkalmazás
│   ├── main.tsx               # Belépési pont
│   └── index.css              # Globális stílusok
├── supabase/
│   ├── config.toml            # Supabase konfiguráció
│   └── functions/             # Edge Functions
├── .env                       # Környezeti változók (auto)
├── package.json               # Projekt konfiguráció
├── tailwind.config.ts         # Tailwind konfiguráció
├── tsconfig.json              # TypeScript konfiguráció
└── vite.config.ts             # Vite konfiguráció
```

---

## 3. Kódolási Konvenciók

### 3.1 Fájl Elnevezések

| Típus | Konvenció | Példa |
|-------|-----------|-------|
| Komponensek | PascalCase | `BookingCard.tsx` |
| Hooks | camelCase, use prefix | `useBookings.ts` |
| Utilities | camelCase | `passwordValidation.ts` |
| Típusok | camelCase | `booking.ts` |
| Oldalak | PascalCase | `UserDashboard.tsx` |

### 3.2 Komponens Struktúra

```typescript
// 1. Importok
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// 2. Típus definíciók
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Komponens
const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // 3.1 Hooks
  const { user } = useAuth();
  const [state, setState] = React.useState(false);

  // 3.2 Handlers
  const handleClick = () => {
    onAction();
  };

  // 3.3 Render
  return (
    <div className="p-4">
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};

// 4. Export
export default MyComponent;
```

### 3.3 TypeScript Szabályok

```typescript
// ✅ Helyes - Explicit típusok
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): Promise<User> => {
  // ...
};

// ❌ Helytelen - any használata
const getUser = (id: any): any => {
  // ...
};
```

### 3.4 Styling Konvenciók

```typescript
// ✅ Helyes - Tailwind osztályok
<div className="flex items-center gap-4 p-4 bg-background text-foreground">

// ✅ Helyes - Feltételes stílusok cn() használatával
import { cn } from '@/lib/utils';

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>

// ❌ Helytelen - Inline stílusok
<div style={{ padding: '16px', backgroundColor: 'red' }}>
```

---

## 4. Komponens Hierarchia

### 4.1 Layout Komponensek

```
App.tsx
├── PublicLayout
│   ├── Header (navigáció, nyelv váltó)
│   ├── Main Content (Outlet)
│   └── Footer
└── DashboardLayout
    ├── Sidebar (navigáció, user info)
    ├── Header (mobil menü, értesítések)
    └── Main Content (Outlet)
```

### 4.2 Védett Útvonal Komponensek

```typescript
// AdminProtectedRoute.tsx
const AdminProtectedRoute: React.FC = () => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (userRole?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
```

### 4.3 Form Komponensek

```typescript
// React Hook Form használata
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Érvénytelen email'),
  password: z.string().min(8, 'Minimum 8 karakter'),
});

const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    // Submit logic
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

---

## 5. Custom Hooks

### 5.1 useAuth

```typescript
// Használat
const { user, profile, userRole, isLoading, signIn, signOut } = useAuth();

// Bejelentkezés
await signIn('user@example.com', 'password');

// Kijelentkezés
await signOut();
```

### 5.2 useBookings

```typescript
// src/hooks/useBookings.ts
export const useBookings = (userId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight_packages (name, base_price_huf),
        flight_time_slots (slot_date, start_time)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId) fetchBookings();
  }, [userId]);

  return { bookings, isLoading, refetch: fetchBookings };
};
```

### 5.3 useTimeSlots

```typescript
export const useTimeSlots = (operatorId?: string, date?: Date) => {
  // Időpontok lekérése operátor és dátum alapján
  // Időpont létrehozás, módosítás, törlés
};
```

### 5.4 usePricing

```typescript
export const usePricing = (packageId: string, slotDate: Date) => {
  // Ár kalkuláció
  // Kedvezmények alkalmazása
  // Kupon validálás
};
```

### 5.5 useNotifications

```typescript
export const useNotifications = (userId: string) => {
  // Értesítések lekérése
  // Olvasottnak jelölés
  // Olvasatlan szám
};
```

---

## 6. State Management

### 6.1 React Context

```typescript
// AuthContext használat
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, userRole, isLoading, ... }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6.2 TanStack Query

```typescript
// Adatlekérés cachinggel
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useFlightPackages = (operatorId: string) => {
  return useQuery({
    queryKey: ['flight-packages', operatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_packages')
        .select('*')
        .eq('operator_id', operatorId);
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 perc
  });
};

// Mutáció cache invalidálással
const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPackage: FlightPackageInsert) => {
      const { data, error } = await supabase
        .from('flight_packages')
        .insert(newPackage)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-packages'] });
    },
  });
};
```

---

## 7. Supabase Integráció

### 7.1 Client Használat

```typescript
// NE SZERKESSZÜK - automatikusan generált
import { supabase } from '@/integrations/supabase/client';

// Típusos lekérések
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .returns<Booking[]>();
```

### 7.2 Típusok Használata

```typescript
// Auto-generált típusok
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
```

### 7.3 RPC Hívások

```typescript
// Adatbázis funkció hívása
const { data: hasAdmin, error } = await supabase
  .rpc('check_super_admin_exists');

// Típusos RPC
const { data } = await supabase
  .rpc('is_operator_subscription_active', {
    _operator_id: operatorId
  });
```

---

## 8. Tesztelési Stratégia

### 8.1 Komponens Tesztek

```typescript
// __tests__/components/BookingCard.test.tsx
import { render, screen } from '@testing-library/react';
import BookingCard from '@/components/booking/BookingCard';

describe('BookingCard', () => {
  it('renders booking details correctly', () => {
    const booking = {
      id: '1',
      status: 'confirmed',
      total_price_huf: 45000,
      // ...
    };

    render(<BookingCard booking={booking} />);
    
    expect(screen.getByText('Megerősített')).toBeInTheDocument();
    expect(screen.getByText('45 000 Ft')).toBeInTheDocument();
  });
});
```

### 8.2 Hook Tesztek

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useBookings } from '@/hooks/useBookings';

describe('useBookings', () => {
  it('fetches bookings for user', async () => {
    const { result } = renderHook(() => useBookings('user-id'));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.bookings).toHaveLength(2);
  });
});
```

### 8.3 E2E Tesztek

```typescript
// Playwright vagy Cypress
describe('Booking Flow', () => {
  it('completes booking successfully', () => {
    cy.login('user@example.com', 'password');
    cy.visit('/foglal');
    cy.get('[data-testid="package-card"]').first().click();
    cy.get('[data-testid="time-slot"]').first().click();
    cy.get('[data-testid="passenger-name"]').type('Test User');
    cy.get('[data-testid="confirm-button"]').click();
    cy.contains('Foglalás sikeres').should('be.visible');
  });
});
```

---

## 9. Hibakezelés

### 9.1 API Hibák

```typescript
try {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking);
  
  if (error) {
    // Supabase error
    console.error('Database error:', error);
    toast.error('Hiba történt', {
      description: error.message
    });
    return;
  }
  
  toast.success('Foglalás sikeres!');
} catch (err) {
  // Network or unexpected error
  console.error('Unexpected error:', err);
  toast.error('Váratlan hiba történt');
}
```

### 9.2 Form Validáció

```typescript
import * as z from 'zod';

const bookingSchema = z.object({
  passengerCount: z.number()
    .min(1, 'Minimum 1 utas')
    .max(4, 'Maximum 4 utas'),
  passengerDetails: z.array(z.object({
    name: z.string().min(2, 'Név megadása kötelező'),
    weight: z.number().min(30).max(150),
  })),
});

// Form validáció
const result = bookingSchema.safeParse(formData);
if (!result.success) {
  // Validation errors
  result.error.issues.forEach(issue => {
    toast.error(issue.message);
  });
}
```

---

## 10. Best Practices

### 10.1 Komponens Szervezés

- **Kis, fókuszált komponensek** - Max 200 sor
- **Props destructuring** - Olvashatóság
- **Memoization** - Teljesítmény optimalizálás
- **Error boundaries** - Hibakezelés

### 10.2 Adatkezelés

- **Optimistic updates** - Jobb UX
- **Query invalidation** - Friss adatok
- **Loading states** - Felhasználói visszajelzés
- **Error handling** - Graceful degradation

### 10.3 Biztonság

- **RLS ellenőrzés** - Minden tábla védett
- **Input validálás** - Frontend és backend
- **Sensitive data** - Csak szükséges adatok
- **Auth state** - Mindig ellenőrizve

### 10.4 Teljesítmény

- **Code splitting** - Lazy loading
- **Image optimization** - Megfelelő méret
- **Debounce/throttle** - Eseménykezelés
- **Memoization** - Felesleges renderelés elkerülése

---

## 11. Deployment

### 11.1 Lovable Deploy

A Lovable automatikusan deployal minden commit után.

### 11.2 Environment Variables

```bash
# Automatikusan beállítva
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
VITE_SUPABASE_PROJECT_ID=xxx
```

### 11.3 Edge Functions

Edge Functions automatikusan deployolódnak a `supabase/functions/` mappából.

**Elérhető Edge Functions:**

| Function | Leírás | Trigger |
|----------|--------|---------|
| `process-reminders` | Foglalási emlékeztetők feldolgozása | Manuális/Cron |
| `check-subscription-expiry` | Előfizetés lejárat ellenőrzés és email | Napi cron (8:00 UTC) |
| `send-notification-email` | Email értesítések küldése | Manuális |

---

## 12. Új Fordítási Kulcsok (1.1 verzió)

Az alábbi fordítási kulcsok kerültek hozzáadásra a `LanguageContext.tsx` fájlban:

### Admin Operators Page

| Kulcs | Magyar | Angol |
|-------|--------|-------|
| `admin.operators.staffActivated` | Staff sikeresen aktiválva | Staff activated successfully |
| `admin.operators.staffDeactivated` | Staff sikeresen felfüggesztve | Staff deactivated successfully |
| `admin.operators.manageSubscription` | Előfizetés kezelése | Manage Subscription |
| `admin.operators.subscriptionPlan` | Csomag | Plan |
| `admin.operators.subscriptionStatus` | Előfizetés státusz | Subscription Status |
| `admin.operators.subscriptionExpires` | Lejárat | Expires |
| `admin.operators.monthlyPrice` | Havi díj | Monthly Price |
| `admin.operators.quickActivate` | Gyors aktiválás | Quick Activate |
| `admin.operators.quickDeactivate` | Gyors deaktiválás | Quick Deactivate |

---

## 13. Hasznos Parancsok

```bash
# Fejlesztői szerver
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint

# Type check
npx tsc --noEmit
```
