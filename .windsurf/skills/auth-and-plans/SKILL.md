---
name: auth-and-plans
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: Auth & Plans (v-frontend)

## Purpose
Define how authentication, session lifecycle, role-based access, and plan-based feature gating work in the project. Apply this skill whenever touching login flows, protected routes, user context, or plan-restricted UI.

---

## 1. AuthContext — What's Available

`src/contexts/auth-context.tsx` exposes:

```ts
interface User {
  id: string;
  name: string;
  email: string;
  role: 'seller' | 'admin';
  planType: 'free' | 'pro' | 'enterprise';
  tenantId: string;
  // other fields surfaced by /auth/me
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise;
  logout: () => Promise;
}
```

### Consuming the context

```tsx
// ✅ Consume only what you need — prevents re-renders from unrelated changes
import { useAuth } from '@/contexts/auth-context';

// Component only needs planType
function ProFeatureButton() {
  const { user } = useAuth();
  if (user?.planType !== 'pro' && user?.planType !== 'enterprise') {
    return ;
  }
  return Exportar Relatório;
}

// ❌ Avoid consuming the full context when only one field is needed
const { user, isAuthenticated, isAdmin, login, logout } = useAuth(); // unnecessary
```

---

## 2. Backend Auth Contract

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | Returns JWT in HttpOnly cookie |
| `/auth/logout` | POST | Clears session server-side |
| `/auth/refresh` | POST | Rotates access token (handled by interceptor) |
| `/auth/me` | GET | Returns current user shape |

**Never** implement manual token parsing client-side. The interceptor in `api.ts` handles 401 → refresh → retry transparently.

---

## 3. Protected Route Pattern

Route protection is handled by middleware or layout-level guards — not inside individual pages.

```tsx
// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSideUser } from '@/lib/auth-server'; // server-side /auth/me call

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSideUser();

  if (!user) redirect('/login');
  if (user.role === 'admin') redirect('/admin/dashboard');

  return {children};
}

// src/app/(admin)/layout.tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSideUser();

  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');

  return {children};
}
```

---

## 4. Plan-Based Feature Gating

**Rule:** All plan logic must flow from `user.planType` via `AuthContext`. Never hardcode plan checks outside of a dedicated utility or component.

```ts
// src/lib/plans.ts — centralize plan capabilities here
export const PLAN_LIMITS = {
  free: {
    maxProducts: 10,
    maxCustomers: 50,
    canExportReports: false,
    canAccessApi: false,
    canUseWebhooks: false,
  },
  pro: {
    maxProducts: 500,
    maxCustomers: 5000,
    canExportReports: true,
    canAccessApi: true,
    canUseWebhooks: false,
  },
  enterprise: {
    maxProducts: Infinity,
    maxCustomers: Infinity,
    canExportReports: true,
    canAccessApi: true,
    canUseWebhooks: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function canAccess(
  planType: PlanType,
  feature: keyof (typeof PLAN_LIMITS)['free']
): boolean {
  return !!PLAN_LIMITS[planType][feature];
}
```

```tsx
// ✅ Usage in components
import { canAccess } from '@/lib/plans';
import { useAuth } from '@/contexts/auth-context';

function ReportExportButton() {
  const { user } = useAuth();
  const hasAccess = user ? canAccess(user.planType, 'canExportReports') : false;

  if (!hasAccess) {
    return (
      
    );
  }
  return ;
}
```

---

## 5. Upgrade CTA Pattern

Always surface a clear, actionable upgrade prompt — never silently hide features.

```tsx
// src/components/ui/upgrade-cta.tsx
interface UpgradeCTAProps {
  message: string;
  targetPlan: 'pro' | 'enterprise';
}

export function UpgradeCTA({ message, targetPlan }: UpgradeCTAProps) {
  return (
    
      {message}
      <a
        href={`/settings/billing?upgrade=${targetPlan}`}
        className="mt-2 inline-block text-sm font-medium text-amber-600 underline dark:text-amber-400"
      >
        Fazer upgrade →
      
    
  );
}
```

---

## 6. Role-Based UI Differences

```tsx
// ✅ Use isAdmin from AuthContext for role-based rendering
function NavigationMenu() {
  const { user, isAdmin } = useAuth();

  return (
    
      {isAdmin && }
      {!isAdmin && }
    
  );
}

// ✅ For server-side checks in layouts, use user.role directly
if (user.role !== 'admin') redirect('/dashboard');
```

---

## 7. Login / Logout Flow

```tsx
// Login — always use AuthContext.login, never call /auth/login directly
const { login } = useAuth();

async function handleLogin(data: LoginFormValues) {
  try {
    await login(data.email, data.password);
    // AuthProvider handles redirect internally based on role
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

// Logout
const { logout } = useAuth();

async function handleLogout() {
  await logout();
  // AuthProvider clears user state and redirects to /login
}
```

---

## 8. js-cookie — Allowed Uses

`js-cookie` is **not for auth**. Allowed uses:

```ts
import Cookies from 'js-cookie';

// ✅ UI preferences (non-sensitive)
Cookies.set('sidebar-collapsed', 'true', { expires: 365 });
const isCollapsed = Cookies.get('sidebar-collapsed') === 'true';

// ✅ Dismissed banners / onboarding state
Cookies.set('onboarding-dismissed', 'true', { expires: 30 });

// ❌ Never store auth tokens, user IDs, or plan data in js-cookie
// These are managed exclusively by HttpOnly cookies via the backend
```

---

## 9. Multi-Tenant Awareness

- Every authenticated request carries `tenantId` in the JWT — backend enforces data isolation.
- Frontend must **never** manually filter data by `tenantId` — trust backend responses.
- When displaying tenant-specific data (store name, logo), read from `user` object in `AuthContext`.
- If an API response ever contains cross-tenant data (should not happen), treat it as a bug and report — do not attempt to filter client-side.

---

## 10. Auth Loading State

`AuthContext` exposes `isLoading` for the initial `/auth/me` check. Use it to prevent flashes of unauthenticated UI.

```tsx
function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return ;
  if (!isAuthenticated) return null; // layout redirect handles this

  return ;
}
```
