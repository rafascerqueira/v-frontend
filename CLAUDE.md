# v-frontend

Next.js 16 App Router + React 19 web app for Vendinhas — seller dashboard,
admin panel, public storefront and marketing/landing pages.

## Stack

| | |
|---|---|
| Package manager | pnpm — **never npm or yarn** |
| Framework | Next.js 16 App Router + React 19 — Server Components by default |
| Language | TypeScript 5 (strict) |
| Styling | TailwindCSS 4 — utility-first, **no custom CSS files** |
| Forms | React Hook Form 7 + Zod 4 (`@hookform/resolvers`) |
| HTTP | Axios via `src/lib/api.ts` (auth + retry on 429) — **never bypass it** |
| State | React Context only — **no Redux/Zustand** |
| Charts | Recharts 3 — **never Chart.js or hand-rolled SVG** |
| Notifications | react-hot-toast 2 + Socket.IO (`socket.io-client`) |
| Animations | Framer Motion 12 |
| Theme | next-themes — dark mode required on every component |
| PWA | `@ducanh2912/next-pwa` |
| Linting | Biome 2 — **never ESLint/Prettier** |
| Testing | Vitest + Testing Library + msw (jsdom) — see the `frontend-test-setup` skill |

## Commands

```bash
pnpm install
pnpm dev          # next dev
pnpm build        # next build (also the TypeScript gate)
pnpm test         # vitest run (unit/component — see frontend-test-setup skill)
pnpm test:watch   # vitest watch mode
pnpm lint         # biome check src/
pnpm lint:fix     # biome check src/ --write
pnpm format       # biome format src/ --write
```

## Route groups (`src/app/`)

| Group | Purpose |
|---|---|
| `(landing)/` | Marketing site. `/` redirects to `/home`. Has its own `header`/`footer`/`layout`. |
| `(public)/` | about, blog, contact, careers, docs, help, status, releases, api, privacy, terms, lgpd, cookies, data-deletion |
| `(auth)/` | login, register, forgot-password, reset-password |
| `(dashboard)/` | Seller app: dashboard, products, customers, orders, billings, stock, suppliers, promotions, bundles, plans, reports, catalog-share, settings |
| `(admin)/` | Admin panel: users, logs, activity, exceptions, settings |
| `loja/[slug]/` | Public storefront + checkout + customer area (`c/[customerId]`, `definir-senha`) |
| `pedido/[orderNumber]/` | Order tracking |

## Key modules (`src/`)

```
lib/
├── api.ts          # authenticated Axios client (interceptors, 429 retry) — use for all auth'd calls
├── api-public.ts   # unauthenticated client for storefront / public pages
├── validators.ts   # shared Zod schemas
├── utils.ts        # cn() etc.
└── use-avatar.ts, releases.ts
contexts/           # auth-context, CartContext, SubscriptionContext — memoize values
hooks/              # useExport, useKeyboardShortcuts, useNotifications
components/         # ui/, subscription/
types/
```

## Conventions

- **Server Components by default** — add `"use client"` only at the leaf that needs interactivity; don't make parents client. Isolate an unavoidable bit of interactivity in a leaf so the page can stay an RSC (e.g. the `BackButton` leaf on the static `(public)` pages).
- **RSC entrance animation** — for a fade/rise on an otherwise-static Server Component, use the `animate-fade-in-up` utility in `globals.css`. **Never** pull Framer Motion into a Server Component (it's client-only).
- **Skeletons & surfaces** use semantic tokens (`bg-surface`, `bg-surface-muted`, `border-border`) — never raw `gray-*` — so light/dark stay in sync. The base `Skeleton` carries the `skeleton-shimmer` sweep.
- **Animate KPIs** with `<AnimatedNumber>` (count-up). Reduced motion is honored app-wide by `<MotionConfig reducedMotion="user">` for Framer; for non-Framer motion gate on `useReducedMotion()`.
- **Memoize context values** to avoid re-render storms.
- **Auth calls** go through `src/lib/api.ts`; public/storefront calls through `src/lib/api-public.ts`.
- Auth tokens live in cookies (`js-cookie` / HttpOnly) — **never localStorage**.
- Portuguese for UX copy; English for code.
- Money in cents (integers), mirroring the backend.
- Multi-tenant isolation comes from the backend JWT — never trust a tenant id from the client.

## Never

- npm / yarn (pnpm only)
- ESLint / Prettier (Biome only)
- localStorage for auth tokens
- Redux / Zustand / other state libs (Context only)
- Chart.js / custom SVG charts (Recharts only)
- Custom toast systems (react-hot-toast only)
- Custom CSS files (Tailwind utilities only — shared keyframes/utilities live in `globals.css`)
- Framer Motion inside a Server Component (use the `animate-fade-in-up` CSS utility for RSC entrances)
- Raw `gray-*` for surfaces/borders/skeletons (use semantic tokens)
