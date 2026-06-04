---
name: data-fetching-patterns
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: Data Fetching Patterns (v-frontend)

## Purpose
Define recipes for every data-fetching scenario in the project. Prevents repeated decisions about caching, loading states, error handling, and cache invalidation.

---

## 1. Decision Tree — Which Pattern to Use

```
Where does the component live?
│
├── Server Component (no "use client")
│   ├── Data is user-specific or always fresh → async/await + no-store
│   ├── Data changes infrequently (plans, categories) → revalidate TTL
│   └── Data is static → force-cache
│
└── Client Component ("use client")
    ├── Data depends on user interaction (search, filter, pagination) → custom hook + service
    ├── Mutation (create, update, delete) → Server Action (preferred) or service direct call
    └── Real-time data → useNotifications (WebSocket)
```

---

## 2. Server Component — Always Fresh (dashboards, user data)

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { dashboardService } from './services';

export default async function DashboardPage() {
  // No try/catch — error.tsx handles it at segment level
  const [metrics, recentOrders] = await Promise.all([
    dashboardService.getMetrics(),
    dashboardService.getRecentOrders(),
  ]);

  return (
    <>
      
      
    </>
  );
}
```

When using raw `fetch` (bypassing Axios for cache control):

```ts
// Always fresh — never cached
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/metrics`, {
  cache: 'no-store',
  headers: { /* auth headers */ },
});
```

---

## 3. Server Component — Cached with TTL (plans, categories, settings)

```ts
// Data that rarely changes — cache for 1 hour, revalidate in background
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/plans`, {
  next: { revalidate: 3600 },
});

// Tag the cache for targeted invalidation later
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
  next: { revalidate: 600, tags: ['categories'] },
});
```

---

## 4. Suspense + Streaming (parallel async components)

Break a page into independent async components to stream them independently — faster Time To First Byte.

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    
      {/* Each section streams independently */}
      }>
         {/* async Server Component */}
      

      }>
         {/* async Server Component */}
      
    
  );
}

// src/app/(dashboard)/dashboard/components/metrics-section.tsx
async function MetricsSection() {
  const metrics = await dashboardService.getMetrics();
  return ;
}
```

---

## 5. Client-Side Fetching — Interactive Data (search, filter, pagination)

```tsx
// src/app/(dashboard)/customers/components/customer-list.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { customersService } from '../services';
import { extractApiError } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UseCustomersParams {
  search: string;
  page: number;
  status: string;
}

export function useCustomers({ search, page, status }: UseCustomersParams) {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customersService.list({ search, page, status });
      setCustomers(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [search, page, status]); // ✅ all primitives — stable deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { customers, total, isLoading, refetch: fetch };
}
```

---

## 6. Mutation — Server Action (preferred for simple mutations)

```ts
// src/app/(dashboard)/customers/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import api from '@/lib/api';
import { extractApiError } from '@/lib/utils';
import type { ActionResult } from '@/types/api';

export async function deleteCustomerAction(id: string): Promise {
  try {
    await api.delete(`/customers/${id}`);
    revalidatePath('/customers');
    return { success: true };
  } catch (err) {
    return { success: false, error: extractApiError(err) };
  }
}
```

```tsx
// Client Component consuming the action
async function handleDelete(id: string) {
  const result = await deleteCustomerAction(id);
  if (!result.success) {
    toast.error(result.error);
    return;
  }
  toast.success('Cliente removido.');
}
```

---

## 7. Mutation — Client Direct Call (when action return value drives UI)

```tsx
'use client';

// When mutation result directly controls complex client state
// and Server Action overhead is unnecessary

async function handleStatusToggle(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  try {
    await customersService.update(id, { status: newStatus });
    // Update local state optimistically
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    toast.success('Status atualizado.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}
```

---

## 8. Optimistic Updates

```tsx
'use client';

function CustomerRow({ customer, onUpdate }: CustomerRowProps) {
  const [optimisticStatus, setOptimisticStatus] = useState(customer.status);

  async function toggleStatus() {
    const next = optimisticStatus === 'active' ? 'inactive' : 'active';

    // ✅ Update UI immediately
    setOptimisticStatus(next);

    const result = await updateCustomerAction(customer.id, { status: next });

    // ✅ Revert on failure
    if (!result.success) {
      setOptimisticStatus(optimisticStatus);
      toast.error(result.error);
    }
  }

  return (
    
      {customer.name}
      
        
      
      
        
          Alternar
        
      
    
  );
}
```

---

## 9. Pagination Pattern

```tsx
'use client';

export function CustomerListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const PER_PAGE = 20;

  const { customers, total, isLoading } = useCustomers({ search, page, status: 'all' });
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    
      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />

      {isLoading ? (
        
      ) : customers.length === 0 ? (
        
      ) : (
        
      )}

      
    
  );
}
```

---

## 10. Search with Debounce

```tsx
'use client';

import { useState, useEffect } from 'react';

// ✅ Debounce hook — avoids API call on every keystroke
function useDebounce(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage:
export function ProductSearch() {
  const [inputValue, setInputValue] = useState('');
  const debouncedSearch = useDebounce(inputValue, 400);

  const { products } = useProducts({ search: debouncedSearch }); // only fires on debounced value

  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)} // updates instantly (controlled)
      placeholder="Buscar produto..."
    />
  );
}
```

---

## 11. Cache Invalidation Reference

| Scenario | Method |
|---|---|
| Created/updated a customer | `revalidatePath('/customers')` |
| Deleted a customer, detail page also affected | `revalidatePath('/customers')` + `revalidatePath(`/customers/${id}`)` |
| Updated data appearing on multiple routes | `revalidateTag('customers')` (requires fetch with tags) |
| User changed plan | `revalidatePath('/settings/billing')` + `revalidatePath('/dashboard')` |
| Admin changed global settings | `revalidatePath('/', 'layout')` — revalidates all routes |
