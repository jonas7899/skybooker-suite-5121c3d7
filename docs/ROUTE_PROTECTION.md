# Route Protection Documentation

## Overview

This document describes the route protection system implemented in the Vári Gyula flight booking application. The system uses role-based access control (RBAC) to restrict access to different parts of the application.

## User Roles

| Role | Description | Database Value |
|------|-------------|----------------|
| **Super Admin** | Platform owner with full system access | `super_admin` |
| **Operator Admin** | Flight company owner with operator-level control | `operator_admin` |
| **Operator Staff** | Limited admin rights within operator context | `operator_staff` |
| **User** | Registered customer for booking flights | `user` |

## Profile Status

Users must have an **active** status to access protected routes:

| Status | Description | Access |
|--------|-------------|--------|
| `bootstrap` | Initial system setup state | No access |
| `pending` | Awaiting admin approval | No access |
| `active` | Approved and active | Full access based on role |
| `rejected` | Registration rejected (24h cooldown) | No access |
| `suspended` | Account suspended by admin | No access |
| `inactive` | Deactivated account | No access |

---

## Protected Routes

### Admin Routes (`/admin/*`)

**Protection Component:** `AdminProtectedRoute`

**Required:** 
- Authenticated user
- Role: `super_admin`

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboard | Platform overview and statistics |
| `/admin/operators` | AdminOperators | Manage flight operators |
| `/admin/users` | AdminUsers | User management and approval |
| `/admin/subscriptions` | AdminSubscriptions | Operator subscription management |
| `/admin/analytics` | AdminAnalytics | Platform-wide analytics |
| `/admin/settings` | AdminSettings | Platform configuration |

**Special Route:**
- `/admin/login` - Not protected, allows Super Admin creation and login

---

### Operator Routes (`/operator/*`)

**Protection Component:** `OperatorProtectedRoute`

**Required:**
- Authenticated user
- Role: `operator_admin` OR `operator_staff`

| Route | Page | Description |
|-------|------|-------------|
| `/operator/calendar` | OperatorCalendar | Flight scheduling management |
| `/operator/bookings` | OperatorBookings | Booking management |
| `/operator/pricing` | OperatorPricing | Pricing and discount configuration |
| `/operator/billing` | OperatorBilling | Billing and invoices |
| `/operator/analytics` | OperatorAnalytics | Operator performance analytics |

---

### User Dashboard Routes (`/dashboard/*`)

**Protection Component:** `UserProtectedRoute`

**Required:**
- Authenticated user
- Profile status: `active`

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard/bookings` | UserBookingsPage | User's flight bookings |

---

### Public Routes

These routes are accessible without authentication:

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Homepage |
| `/hirek` | Hirek | News and information |
| `/rolam` | Rolam | About Vári Gyula |
| `/idopontok` | AvailabilityCalendar | Public flight schedule |
| `/belepes` | Login | User login |
| `/regisztracio` | Register | User registration |
| `/admin/login` | AdminLogin | Admin login / Super Admin creation |

---

## Authentication Flow

### User Registration
1. User submits registration form at `/regisztracio`
2. Profile created with `pending` status
3. Admin approves/rejects at `/admin/users`
4. If approved: status → `active`, user can access dashboard
5. If rejected: status → `rejected`, 24h cooldown before retry

### Super Admin Bootstrap
1. First access to `/admin/login` shows "Create Super Admin" form
2. Creates user with `active` status and `super_admin` role
3. Uses `create_first_super_admin()` database function
4. Subsequent visits show normal admin login

---

## Protection Components

### AdminProtectedRoute
```tsx
// Location: src/components/auth/AdminProtectedRoute.tsx
// Checks: user exists && userRole.role === 'super_admin'
// Redirect: /admin/login (if not logged in) or / (if wrong role)
```

### OperatorProtectedRoute
```tsx
// Location: src/components/auth/OperatorProtectedRoute.tsx
// Checks: user exists && (role === 'operator_admin' || role === 'operator_staff')
// Redirect: /belepes (if not logged in) or / (if wrong role)
```

### UserProtectedRoute
```tsx
// Location: src/components/auth/UserProtectedRoute.tsx
// Checks: user exists && profile.status === 'active'
// Redirect: /belepes (if not logged in) or / (if not active)
```

---

## Database Security

### Row Level Security (RLS)

All tables have RLS policies that enforce access control at the database level:

- **profiles**: Users can view/update own profile; Admins can view all
- **user_roles**: Users can view own roles; Super Admins can manage all
- **bookings**: Users see own bookings; Operators see bookings for their slots
- **flight_packages**: Public view for active packages; Operators manage own
- **flight_time_slots**: Public view for available slots; Operators manage own

### Security Definer Functions

| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Check if user has specific role |
| `get_user_operator_id(user_id)` | Get operator ID for user |
| `create_first_super_admin(...)` | Bootstrap first Super Admin |
| `is_operator_subscription_active(operator_id)` | Check subscription status |

---

## Route Configuration

Routes are configured in `src/App.tsx`:

```tsx
// Admin Routes (protected, super_admin only)
<Route path="/admin" element={<AdminProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route index element={<AdminDashboard />} />
    ...
  </Route>
</Route>

// Operator Routes (protected, operator_admin and operator_staff only)
<Route path="/operator" element={<OperatorProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    ...
  </Route>
</Route>

// User Dashboard Routes (protected, active users only)
<Route path="/dashboard" element={<UserProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    ...
  </Route>
</Route>
```

---

## Internationalization

All protected pages support Hungarian (hu) and English (en) languages:
- Language switcher available in DashboardLayout header
- Translations stored in `src/contexts/LanguageContext.tsx`
- Admin pages use `t('key')` function for translations
