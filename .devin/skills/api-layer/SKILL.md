---
name: api-layer
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: API Layer (v-frontend)

## Purpose
Define how to use, extend, and maintain the centralized HTTP layer. Every data-fetching or mutation pattern in the project routes through this skill.

---

## 1. The Two Clients — When to Use Each

```
src/lib/
├── api.ts          → authenticated requests (carries credentials + interceptors)
└── api-public.ts   → public/anonymous requests (catalog, terms, no auth header)
```

| Scenario | Client |
|---|---|
| Any dashboard, admin, or user-specific route | `api` |
| Public catalog (`/catalog/**`) | `apiPublic` |
| Server Actions that mutate user data | `api` (imported server-side) |
| Checking if a store slug exists (anonymous) | `apiPublic` |

**Never** instantiate `axios.create()` outside these files. **Never** use raw `fetch` for API calls without explicit approval.

---

## 2. Adding a New Endpoint

Do not scatter API calls across components. Centralize them in a `services` module per feature or in the Server Action file.

```ts
// src/app/(dashboard)/customers/services.ts
import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from './types';

export const customersService = {
  list: (params?: { page?: number; search?: string }) =>
    api.get<PaginatedResponse>('/customers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse>(`/customers/${id}`),

  create: (data: CreateCustomerInput) =>
    api.post<ApiResponse>('/customers', data),

  update: (id: string, data: UpdateCustomerInput) =>
    api.patch<ApiResponse>(`/customers/${id}`, data),

  remove: (id: string) =>
    api.delete<ApiResponse>(`/customers/${id}`),
};
```

---

## 3. Server Action vs API Route vs Client Fetch — Decision Tree

```
Mutation needed?
│
├── Simple (no file upload, no complex orchestration)
│   └── → Server Action (preferred)
│
├── Needs streaming / webhook / cron
│   └── → API Route (src/app/api/**)
│
└── Read-only data in Client Component
    └── → Call service directly via useEffect or React Query pattern
```

### Server Action template

```ts
// src/app/(dashboard)/customers/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import api from '@/lib/api';
import { extractApiError } from '@/lib/utils';
import type { ActionResult } from '@/types/api';
import type { Customer, CreateCustomerInput } from './types';

export async function createCustomerAction(
  input: CreateCustomerInput
): Promise<ActionResult> {
  try {
    const res = await api.post('/customers', input);
    revalidatePath('/customers');
    return { success: true, data: res.data.data };
  } catch (err) {
    return { success: false, error: extractApiError(err) };
  }
}
```

---

## 4. Error Handling — Standard Pattern

All API errors must be handled consistently. Use `extractApiError` from `src/lib/utils.ts`.

```ts
// src/lib/utils.ts
import { AxiosError } from 'axios';

export function extractApiError(err: unknown): string {
  if (err instanceof AxiosError) {
    // Backend validation errors (array)
    const messages = err.response?.data?.errors;
    if (Array.isArray(messages)) return messages.join(', ');
    // Backend message string
    if (typeof err.response?.data?.message === 'string') {
      return err.response.data.message;
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Erro inesperado. Tente novamente.';
}
```

In Client Components, always surface errors via `react-hot-toast`:

```ts
import toast from 'react-hot-toast';

const result = await createCustomerAction(data);
if (!result.success) {
  toast.error(result.error);
  return;
}
toast.success('Cliente criado com sucesso!');
```

---

## 5. Interceptors — What They Do (Do Not Duplicate)

`api.ts` already handles:
- **Request interceptor:** attaches auth header / credentials
- **Response interceptor (401):** calls `/auth/refresh` once, retries original request
- **Response interceptor (403):** redirects to `/login` after failed refresh

Do not add try/catch around refresh logic — the interceptor handles it. Your service/action only needs to handle business-level errors.

---

## 6. Fetching in Server Components

In Server Components, import `api` directly. Use Next.js `fetch` cache semantics only when you bypass Axios intentionally (static public data).

```tsx
// src/app/(dashboard)/customers/page.tsx
import { customersService } from './services';

export default async function CustomersPage() {
  // No try/catch needed here — error.tsx handles it
  const response = await customersService.list({ page: 1 });
  const customers = response.data.data;

  return ;
}
```

For public static data (rarely needed):

```ts
// Only when bypassing Axios is justified for cache control
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/plans`, {
  next: { revalidate: 3600 }, // cache for 1 hour
});
const plans = await res.json();
```

---

## 7. Client-Side Fetching Pattern (when Server Component is not possible)

When data depends on user interaction (search, filter, pagination) and cannot be handled by Server Actions:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { customersService } from '../services';
import { extractApiError } from '@/lib/utils';
import toast from 'react-hot-toast';

export function useCustomers(search: string) {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customersService.list({ search });
      setCustomers(res.data.data);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [search]); // ✅ stable dep — search is a primitive

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, isLoading, refetch: fetchCustomers };
}
```

---

## 8. Revalidation After Mutations

```ts
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate a specific route
revalidatePath('/customers');
revalidatePath(`/customers/${id}`);

// Revalidate by tag (more granular — requires fetch with tags)
revalidateTag('customers');

// Use revalidateTag when the same data appears in multiple routes
// Use revalidatePath when mutation affects one clear route
```

---

## 9. File Upload Pattern

```ts
// Service method for file upload
uploadProductImage: (productId: string, file: File) => {
  const form = new FormData();
  form.append('image', file);
  return api.post<ApiResponse>(
    `/products/${productId}/image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
},
```

---

## 10. Environment Variables

| Variable | Used in | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `api.ts`, `api-public.ts` | Backend base URL |

- Never hardcode the API URL anywhere outside `src/lib/`.
- `NEXT_PUBLIC_` prefix exposes to browser bundle — only add to truly public vars.
- Server-only secrets (API keys, signing secrets) must NOT have `NEXT_PUBLIC_` prefix.
