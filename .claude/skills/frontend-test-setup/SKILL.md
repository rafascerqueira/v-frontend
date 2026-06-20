---
name: frontend-test-setup
description: "Establishing and using the frontend test stack for Next.js 16 + React 19. Test strategy, runner choice, component testing, Axios mocking, form validation, regression patterns. Trigger keywords: frontend test, vitest, react testing library, component test, unit test, regression, v-frontend, Next.js test, React 19 test"
---

## Installed stack (active)

The test stack is **installed and active** in `v-frontend`:

| Layer | Tool | Notes |
|---|---|---|
| Runner + assertions | **Vitest** | Native ESM — resolves Framer Motion / Recharts / socket.io-client with zero transform config (the reason over Jest). |
| Component rendering | **@testing-library/react** | React 19; query by role/label, not implementation. |
| DOM matchers + env | `@testing-library/jest-dom` + `jsdom` | `toBeInTheDocument()` etc.; registered in `vitest.setup.ts`. |
| HTTP mocking | `msw` | Intercept `axios` at the network layer (or `vi.spyOn` the `api` instance for simple cases). |
| Next.js mocks | manual stubs | `next/navigation` is stubbed globally in `vitest.setup.ts`; mock `next/image`, `framer-motion`, `socket.io-client` per-test. |

- **Config:** `vitest.config.ts` (jsdom, `globals: true`, tsconfig path aliases) + `vitest.setup.ts` (jest-dom + global `next/navigation` stub).
- **Scripts:** `pnpm test` (single run), `pnpm test:watch`, `pnpm test:coverage`.
- Why Vitest over Jest: Jest needs extra transform config for the ESM-heavy dep graph; Vitest resolves the same modules Vite does with zero setup.

---

## Scope — what to test and what not to

Apply the "change surface + immediate blast radius" mandate:

**Test these when changed:**
- Pure utility functions in `src/lib/utils.ts`, `src/lib/validators.ts` — pure TypeScript, no DOM needed.
- Form validation schemas in `src/lib/validators.ts` — Zod schemas are synchronous and cheap to test.
- Client components that own significant conditional logic (plan gates, error states, empty states).
- `src/lib/api.ts` retry / interceptor logic — stub `axios` to emit a 429, assert the retry fires.

**Do not test:**
- Server Components — they run in Node, not jsdom. TypeScript build (`pnpm build`) catches type errors; e2e/backend tests cover the data contract.
- Tailwind class names — they are style, not behavior.
- Pages as integration harnesses — too much Next.js infra (router, cookies, middleware) to stub correctly in jsdom.
- Recharts chart rendering — visual regression requires Playwright/Chromium, not jsdom.

---

## Playbook (after runner is approved and installed)

### 1. Place test files

Mirror the source file structure: `src/lib/utils.ts` → `src/lib/utils.test.ts`. Component tests go next to the component: `src/components/ui/Button.tsx` → `src/components/ui/Button.test.tsx`.

### 2. Pure utility tests (no DOM)

```typescript
// src/lib/validators.test.ts
import { describe, it, expect } from 'vitest'
import { productSchema } from './validators'

describe('productSchema', () => {
  it('rejects a negative price', () => {
    const result = productSchema.safeParse({ price: -1, name: 'X' })
    expect(result.success).toBe(false)
  })

  it('accepts price as integer cents', () => {
    // Money must be an integer — assert Number.isInteger
    const result = productSchema.safeParse({ price: 1990, name: 'Produto' })
    expect(result.success).toBe(true)
    if (result.success) expect(Number.isInteger(result.data.price)).toBe(true)
  })
})
```

### 3. Component tests

```typescript
// src/components/ui/PriceDisplay.test.tsx
import { render, screen } from '@testing-library/react'
import { PriceDisplay } from './PriceDisplay'

it('formats 1990 cents as R$ 19,90', () => {
  render(<PriceDisplay cents={1990} />)
  expect(screen.getByText('R$ 19,90')).toBeInTheDocument()
})

it('never renders a float', () => {
  render(<PriceDisplay cents={1990} />)
  // The rendered text must not contain a raw decimal representation of 19.9
  expect(screen.queryByText(/19\.9[^0]/)).toBeNull()
})
```

### 4. Axios / API client tests

Stub at the module boundary, not by mocking the network globally:

```typescript
import { vi, it, expect } from 'vitest'
import * as apiModule from '@/lib/api'

it('retries once on 429 then resolves', async () => {
  const get = vi.spyOn(apiModule.api, 'get')
    .mockRejectedValueOnce({ response: { status: 429 } })
    .mockResolvedValueOnce({ data: [] })

  const result = await getProducts()
  expect(get).toHaveBeenCalledTimes(2)
  expect(result).toEqual([])
})
```

### 5. Next.js navigation mocks

App Router hooks (`useRouter`, `useParams`, `usePathname`) are not available in jsdom. Add a vitest setup file:

```typescript
// vitest.setup.ts
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => ({}),
  usePathname: () => '/',
}))
```

### 6. Running tests

```bash
pnpm test            # single run (vitest run)
pnpm test:watch      # watch mode
pnpm test:coverage   # coverage report
```

---

## Invariants every frontend test must honor

### Money
- Always integer cents in props and API responses. Assert `Number.isInteger(value)` for any money field.
- Format assertions must match the pt-BR locale pattern: `R$ 19,90`, not `19.90` or `R$19,90`.

### Tenant isolation
- The frontend does not enforce tenant isolation — that is the backend's job via JWT.
- Do NOT write frontend tests that assert cross-tenant behavior; write those in the backend e2e suite.
- Do assert that the API client always sends the `Authorization` header (or relies on cookies set by the backend) — the frontend must never strip or ignore auth.

### Determinism
- No `Math.random()`, no `Date.now()` in assertion values. Use fixed seeds.
- No real `axios` calls — always mock `src/lib/api.ts` or `src/lib/api-public.ts`.
- No Framer Motion in tests — mock it: `vi.mock('framer-motion', () => ({ motion: { div: 'div' } }))`.

---

## Gotchas

- **Server Components cannot render in jsdom.** If you try to render a page component that is an async RSC, Vitest will throw. Test client leaf components only.
- **Framer Motion** uses browser APIs not available in jsdom (`ResizeObserver`, `IntersectionObserver`). Always mock the module.
- **Recharts** renders SVG; jsdom SVG support is incomplete. Do not assert on chart internals — assert on the data passed as props.
- **socket.io-client** opens a real WebSocket. Mock `src/hooks/useNotifications.ts` rather than the socket library.
- **`next/image`** optimizes images at request time — not available in jsdom. Mock: `vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))`.
- **Auth tokens live in HttpOnly cookies** — not accessible in jsdom. Do not test token storage in the frontend. Test that the API client correctly passes the cookie jar to `axios` by inspecting request headers in the mock.

---

## References

- `v-frontend/CLAUDE.md` — stack, test commands, auth/routing conventions
- `v-frontend/package.json` — Vitest / Testing Library / msw devDeps + test scripts
- `v-frontend/vitest.config.ts`, `vitest.setup.ts` — runner config + jsdom/jest-dom setup
- `v-frontend/src/lib/api.ts` — auth Axios client (primary mock target)
- `v-frontend/src/lib/validators.ts` — Zod schemas (cheapest test targets)
- `v-backend/.claude/skills/e2e-supertest-harness/SKILL.md` — backend e2e patterns for cross-tenant and cents invariants (backend is the authority)
