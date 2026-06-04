---
trigger: always_on
---
trigger: always_on
description: always apply these rules when working on the project
---

# v-frontend Core Rules (Always On)

You are a senior Next.js engineer working on https://github.com/rafascerqueira/v-frontend (Vendinhas SaaS dashboard).

---

## Tech Stack (pinned versions — keep aligned everywhere)

- **Runtime:** Node.js 22 | **Package manager:** pnpm 9
- **Framework:** Next.js 16 App Router + React 19 | **Rendering:** hybrid (SSR + RSC)
- **Language:** TypeScript 5 (strict) | Module resolution managed by `next.config.ts`
- **Styling:** TailwindCSS 4 + design tokens + `tailwind-merge` 3 | **Animations:** Framer Motion 12
- **Forms & validation:** React Hook Form 7 + `@hookform/resolvers` 5 + Zod 4 (NEVER class-validator)
- **HTTP:** Axios 1 (`api.ts` with credentials, `api-public.ts` without) | **WebSocket:** socket.io-client 4
- **Charts:** Recharts 3 (only charting library — never suggest Chart.js, Victory, or custom SVG charts)
- **Toast notifications:** react-hot-toast 2 (never create a custom toast system or suggest another lib)
- **Icons:** Lucide React (never import from other icon sets)
- **Cookies (non-auth):** js-cookie 3 — used for non-HttpOnly client preferences (theme, UI state). Never use it for auth tokens.
- **Class composition:** always use the `cn()` helper (`clsx` + `tailwind-merge`) for conditional/dynamic class strings
- **State:** React context/hooks only (no Redux, Zustand, MobX, Jotai, or any external state manager)
- **Auth context:** lives in `src/contexts/auth-context.tsx`
- **Lint/format:** Biome 2 (never ESLint or Prettier) | **Tests:** Next build/type-check for now (add Playwright/Jest only with explicit approval)
- **PWA:** `@ducanh2912/next-pwa` wrapper in `next.config.ts`

---

## Project Overview

- UX copy in **Portuguese (Brazil)**, code in **English**.
- Multi-tenant: every authenticated request carries seller tenant info from backend JWT; respect plan limits via `user.planType` from `AuthContext`.
- App provides: seller dashboard, admin panel, and public catalog — driven by backend modules (customers, products, orders, billing, notifications).
- Dark/light theme, responsive, installable PWA, real-time notifications. All new features must align with these pillars.

---

## Architecture & Folders (follow existing layout strictly)

```
src/
├── app/                  # App Router — screens and layouts only
│   ├── (admin)/          # Admin panel routes
│   ├── (auth)/           # Login / register
│   ├── (dashboard)/      # Seller routes
│   ├── (public)/         # Terms, privacy
│   └── catalog/          # Public catalog
├── components/ui/        # Shared, reusable UI primitives
├── contexts/             # React Contexts (auth, subscription, etc.)
├── hooks/                # Custom hooks
├── lib/                  # Utilities — api.ts, api-public.ts, utils.ts
└── types/                # Shared TypeScript types
```

- Do **not** create new top-level folders without approval.
- Extend existing feature folders to keep routing cohesive.
- Shared types live next to their usage or in `types.ts` within feature folders if broadly reused.

---

## Server vs Client Components — Decision Rule

Before writing any component, ask: **does this require browser APIs, event handlers, or React state/effects?**

| Needs | Component type |
|---|---|
| Data fetching, static rendering, no interactivity | `Server Component` (default) |
| `useState`, `useEffect`, event handlers, hooks | `Client Component` — add `"use client"` |
| Browser APIs (`window`, `localStorage`, sockets) | `Client Component` |

### Rules

- **Default to Server Components.** Add `"use client"` only when strictly necessary.
- **Isolate interactivity at the leaf level.** A client directive on a parent makes all its subtree client-side. Extract the interactive part into a small child component instead.
- **Pass Server Components as `children`** into Client wrappers to preserve RSC benefits across the boundary.
- Never put `"use client"` on layout files unless the entire layout genuinely requires it.

---

## Re-rendering & Performance — Critical Rules

This is a high-priority concern. Every component authored must be evaluated against these rules.

### Context

- Keep contexts **granular and single-purpose.** A "fat" context (auth + theme + notifications combined) re-renders every consumer on any change. Separate them.
- The `AuthProvider` value object **must be memoized** with `useMemo` to prevent re-rendering all consumers on every parent render.
- Consume only what you need: if a component only needs `user.planType`, do not consume the entire `AuthContext`.

### Memoization

- Use `useMemo` for **expensive derived computations** or to **stabilize object/array references** passed as props or context values.
- Use `useCallback` for **functions passed as props** to memoized children or used as effect dependencies.
- **Do not over-memoize.** Wrapping every function/value is noise and harms readability. Apply only when there is a measurable or clearly expected re-render cost.
- Use `React.memo()` for pure presentational components that receive stable props and render frequently (e.g., table rows, chart items).

### Common antipatterns — always avoid

```tsx
// ❌ New object reference on every render

// ✅ Extract to a constant or Tailwind class

// ❌ Inline array/object as prop

// ✅ useMemo or define outside component

// ❌ Derived state via useState
const [fullName, setFullName] = useState(`${first} ${last}`);
// ✅ Compute directly: const fullName = `${first} ${last}`;

// ❌ useEffect with unstable object dependency
useEffect(() => { ... }, [user]); // user is a new object every render
// ✅ Depend on primitives: [user.id, user.planType]

// ❌ key={index} in lists
items.map((item, i) => )
// ✅ key={item.id}

// ❌ watch() when only final value is needed (RHF)
const value = watch('email'); // subscribes to every keystroke
// ✅ getValues('email') inside handlers when real-time subscription is not required
```

---

## App Router Conventions

Always use Next.js special files for their intended purpose — never replicate these behaviors in client-side code:

| File | Purpose |
|---|---|
| `layout.tsx` | Persistent shell, providers, navigation |
| `page.tsx` | Route entry point (Server Component by default) |
| `loading.tsx` | Suspense fallback for the route segment |
| `error.tsx` | Error boundary for the route segment (`"use client"`) |
| `not-found.tsx` | 404 handler for the segment |

- Wrap async Server Components that fetch data in `<Suspense>` with a meaningful `fallback`.
- Use `error.tsx` per-segment rather than wrapping everything in a single top-level try/catch.

---

## Data Fetching, Caching & Mutations

### Server Components

- Prefer `fetch` with Next.js cache semantics in Server Components when possible:
  - `{ cache: 'force-cache' }` — static data, revalidated manually
  - `{ next: { revalidate: 60 } }` — ISR-style TTL
  - `{ cache: 'no-store' }` — always fresh (dashboards, user-specific data)
- Use `revalidatePath()` / `revalidateTag()` after mutations to invalidate stale cache.

### Client Components

- Use the centralized Axios clients (`api.ts` / `api-public.ts`). Never instantiate a new `axios.create()` or raw `fetch` outside `src/lib/` without approval.
- Mutations from client components that are simple (no file upload, no complex orchestration) should prefer **Server Actions** over creating a new API route:

```tsx
// ✅ Server Action for simple mutations
'use server';
export async function updateCustomer(id: string, data: CustomerInput) {
  await api.patch(`/customers/${id}`, data);
  revalidatePath('/customers');
}
```

---

## API, Auth & Data Flow

- All authenticated calls **must** use `api` (with credentials) — refresh-token retry and `/auth/me` guard depend on it. Never bypass interceptors.
- Public/catalog flows must use `apiPublic`.
- Backend auth contract: `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/me`. Redirects must stay consistent with `AuthProvider`.
- Plan restrictions: use `user.planType` from `AuthContext` for feature gating and upgrade CTAs. **Never hardcode plan logic anywhere else.**
- **`js-cookie` is for non-auth client preferences only** (UI state, display settings). Auth tokens live exclusively in HttpOnly cookies managed server-side.

---

## WebSocket & Notifications

- Always reuse `useNotifications` hook. Do not open ad-hoc socket connections.
- New real-time features must follow `useNotifications` patterns: attach `user.id` as query param, honor reconnection/backoff, and clean up on unmount.
- No `console.log` in socket handlers in production — guard with `if (process.env.NODE_ENV === 'development')`.

---

## Forms (React Hook Form + Zod)

- Always connect Zod schemas to RHF via `@hookform/resolvers/zod`.
- **`watch()`** subscribes to every keystroke and triggers re-renders — use only when real-time UI reaction is required (e.g., live preview, conditional field visibility).
- **`getValues()`** reads without subscribing — prefer it inside `onSubmit` handlers and event callbacks.
- **`setValue()`** for programmatic updates. Never mix controlled React state with RHF fields.
- Define Zod schemas outside the component to avoid recreation on every render.

---

## UI/UX, Styling & Accessibility

- Utility-first TailwindCSS 4. No custom CSS files unless truly unavoidable.
- Always compose dynamic class strings with `cn()` (`clsx` + `tailwind-merge`).
- All new components must render correctly in **both light and dark themes** (via `next-themes`).
- Use `next/image` for all images — never bare `<img>` tags (layout shift, lazy loading, optimization).
- **Accessibility is non-negotiable:** semantic HTML, `aria-*` labels, focus states, keyboard navigation, and descriptive form error messages.
- Framer Motion for transitions — keep them purposeful and consistent with existing motion patterns.
- Mobile-first responsive layout. Test all new UI at mobile breakpoints.

---

## Quality Gates

Before every change set:

1. `pnpm lint` (Biome) — must pass with zero errors
2. `pnpm build` — must compile without type errors
3. `pnpm format` — run when touching multiple files
4. No `any` types. If backend returns new shapes, update shared types/interfaces.
5. No unused variables, imports, or `console.log` outside dev guards.
6. Imports ordered automatically by Biome — do not manually sort.

---

## Forbidden

- CSS frameworks other than TailwindCSS 4 (no styled-components, Chakra, MUI, Radix standalone, etc.)
- Direct `fetch` / new `axios` instances outside `src/lib/api*.ts` without approval
- `localStorage` or `sessionStorage` for auth tokens — HttpOnly cookies only
- Ad-hoc socket connections — always use `useNotifications` or extend its pattern
- Downgrading any stack version or introducing alternative linters/build tools
- Charting libraries other than Recharts
- Toast/notification systems other than react-hot-toast
- External state managers (Redux, Zustand, Jotai, MobX, etc.)

---

## Decision Checklist (run before writing any component or feature)

```
1. [ ] Server or Client Component?
       → No interactivity needed? → Server Component (no "use client")
       → Needs state/effects/events? → Client Component, isolated at leaf level

2. [ ] Does this cause unnecessary re-renders?
       → Context value memoized?
       → Stable references for props (no inline objects/arrays)?
       → Correct keys on lists?
       → watch() vs getValues() evaluated?

3. [ ] Data fetching strategy correct?
       → Server Component → fetch with cache semantics
       → Simple mutation → Server Action first, API route second
       → Client fetch → always through api.ts / api-public.ts

4. [ ] App Router files used correctly?
       → Loading state → loading.tsx (not useState + spinner in page)
       → Errors → error.tsx per segment (not global try/catch)
       → 404 → not-found.tsx

5. [ ] UI checklist:
       → next/image for all images?
       → cn() for dynamic classes?
       → Dark mode verified?
       → Accessible (aria, focus, keyboard)?
       → Mobile-first?
```

