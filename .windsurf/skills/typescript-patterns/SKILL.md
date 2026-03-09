---
name: typescript-patterns
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: TypeScript Patterns (v-frontend)

## Purpose
Define how to write, organize, and extend TypeScript types throughout the project. This skill is the foundation for every other skill — apply it whenever creating or modifying any `.ts` or `.tsx` file.

---

## 1. Type vs Interface — Project Convention

```ts
// ✅ Use `interface` for object shapes that may be extended (API responses, props)
interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface CustomerWithOrders extends Customer {
  orders: Order[];
}

// ✅ Use `type` for unions, intersections, mapped types, and utility compositions
type PlanType = 'free' | 'pro' | 'enterprise';
type CreateCustomerInput = Omit;
type ApiResponse = { data: T; message: string };
```

---

## 2. Typing Axios Responses

Always type both the Axios wrapper and the inner data shape. Never use `any` for API responses.

```ts
// src/lib/api.ts pattern — requests are already typed at call site:
import api from '@/lib/api';

// ✅ Type the response data directly
const response = await api.get<ApiResponse>('/customers');
const customers = response.data.data; // Customer[]

// ✅ Reusable wrapper type for paginated responses
interface PaginatedResponse {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

const response = await api.get<PaginatedResponse>('/customers?page=1');
```

---

## 3. Typing Server Actions

```ts
// ✅ Always return a discriminated union — never throw from a Server Action consumed by the client
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// src/app/(dashboard)/customers/actions.ts
'use server';

export async function createCustomer(
  input: CreateCustomerInput
): Promise<ActionResult> {
  try {
    const response = await api.post<ApiResponse>('/customers', input);
    revalidatePath('/customers');
    return { success: true, data: response.data.data };
  } catch (err) {
    return { success: false, error: extractApiError(err) };
  }
}

// Usage in Client Component:
const result = await createCustomer(data);
if (!result.success) {
  toast.error(result.error);
  return;
}
toast.success('Cliente criado com sucesso!');
```

---

## 4. Discriminated Unions for State

Replace boolean flag combinations with a single discriminated union. This eliminates impossible states.

```ts
// ❌ Boolean flag hell — allows impossible states like loading=true + error="something"
interface RequestState {
  isLoading: boolean;
  isError: boolean;
  data: Customer[] | null;
  error: string | null;
}

// ✅ Discriminated union — each state is explicit and exhaustive
type AsyncState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Usage:
const [state, setState] = useState<AsyncState>({ status: 'idle' });

// TypeScript narrows correctly in JSX:
if (state.status === 'success') {
  return ; // data: Customer[] ✅
}
```

---

## 5. Utility Types — Use These Instead of Rewriting Shapes

```ts
// Given base interface:
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Input for creation (strip server-generated fields)
type CreateProductInput = Omit;

// ✅ Input for update (all optional except id)
type UpdateProductInput = Partial<Omit>;

// ✅ List view (only what the table needs)
type ProductSummary = Pick;

// ✅ Form values (may differ from API shape)
type ProductFormValues = Omit & {
  category: { id: string; label: string }; // richer for Select component
};
```

---

## 6. Component Props Convention

```ts
// ✅ Name props interface after the component
interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// ✅ Extend HTML element props when wrapping native elements
interface ButtonProps extends React.ButtonHTMLAttributes {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

// ✅ Use React.PropsWithChildren when accepting children
interface CardProps extends React.PropsWithChildren {
  title: string;
  className?: string;
}

// ✅ Use React.ReactNode for explicit children typing
interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}
```

---

## 7. Handling `unknown` from API / External Sources

```ts
// ✅ Helper to extract error messages safely — add to src/lib/utils.ts
export function extractApiError(err: unknown): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Erro inesperado. Tente novamente.';
}

// ✅ Type guard for API error shape
function isApiValidationError(err: unknown): err is AxiosError }> {
  return (
    err instanceof AxiosError &&
    typeof err.response?.data?.errors === 'object'
  );
}
```

---

## 8. Enums vs Const Objects

Avoid TypeScript `enum` — use `const` objects with `as const` for better tree-shaking and type inference.

```ts
// ❌ Avoid TS enum
enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Delivered = 'delivered',
}

// ✅ Prefer const object
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
// OrderStatus = 'pending' | 'confirmed' | 'delivered'
```

---

## 9. File Organization for Types

```
src/
├── types/                         # Truly global shared types
│   └── api.ts                     # ApiResponse<T>, PaginatedResponse<T>, ActionResult<T>
│
├── app/(dashboard)/customers/
│   ├── types.ts                   # Customer, CreateCustomerInput, CustomerFormValues
│   ├── page.tsx
│   └── components/
│
├── contexts/
│   └── auth-context.tsx           # User, AuthContextValue defined inline (tightly coupled)
```

Rules:
- Types used in **only one** feature → define in `feature/types.ts`
- Types used **across multiple features** → promote to `src/types/`
- Types tightly coupled to a context or hook → define in the same file
- Never create a monolithic `src/types/index.ts` with unrelated types dumped together

---

## 10. Strict Mode Reminders

`tsconfig.json` has `strict: true`. This means:

```ts
// ❌ These will fail — fix them properly, never cast with `as`
const user = getUser(); // possibly undefined
user.name; // Error: Object is possibly undefined

// ✅ Narrow first
if (!user) return null;
user.name; // string ✅

// ✅ Or use optional chaining
const name = user?.name ?? 'Desconhecido';

// ❌ Avoid `as` casting to silence errors — it hides real bugs
const data = response.data as Customer; // unsafe

// ✅ Validate shape at the boundary (Zod parse)
const data = CustomerSchema.parse(response.data); // throws if wrong shape
```
