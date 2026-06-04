---
name: component-patterns
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: Component Patterns (v-frontend)

## Purpose
Define how to create, compose, and extend UI components. Ensures visual and structural consistency across the seller dashboard, admin panel, and public catalog.

---

## 1. The `cn()` Helper — Always Use for Dynamic Classes

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// ✅ Compose classes safely — no conflicts, no duplication
<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-primary bg-primary/10',
  className // always allow external override via className prop
)} />

// ❌ String concatenation — conflicts not resolved

```

---

## 2. Component File Structure

```
src/components/ui/
├── button.tsx          # Base Button with variants
├── card.tsx            # Card container
├── input.tsx           # Text input wrapper
├── badge.tsx           # Status/label badges
├── modal.tsx           # Dialog/modal wrapper
├── skeleton.tsx        # Loading skeleton
└── ...

src/app/(dashboard)/customers/
├── page.tsx                      # Route entry — Server Component
├── types.ts                      # Feature types
├── services.ts                   # API calls
├── actions.ts                    # Server Actions
└── components/
    ├── customer-table.tsx        # Feature-specific component
    ├── customer-form.tsx         # Feature-specific form
    └── customer-card.tsx         # Feature-specific card
```

Rules:
- `src/components/ui/` → truly reusable primitives, no business logic
- `src/app/**/components/` → feature-specific, can import from `ui/` and use business types
- Never import from a sibling feature folder (e.g., `customers` importing from `products`)

---

## 3. Variant Pattern for Base Components

```tsx
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  outline: 'border border-input bg-background hover:bg-accent',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4',
  lg: 'h-12 px-6 text-lg',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    
      {isLoading ?  : null}
      {children}
    
  );
}
```

---

## 4. Composition with `children` — Preserve RSC Benefits

```tsx
// ✅ Wrapper is Client (needs interactivity), children remain Server Components
'use client';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode; // Server Components passed as children — they stay RSC
}

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    
      <button onClick={() => setIsOpen((o) => !o)}>{title}
      {isOpen && {children}}
    
  );
}

// Usage in a Server Component page:
export default async function ProductsPage() {
  const products = await productsService.list(); // server-side fetch

  return (
     {/* client wrapper */}
       {/* stays server */}
    
  );
}
```

---

## 5. Skeleton Loading Pattern

Always provide skeletons that match the layout of the real content — avoid generic spinners for content areas.

```tsx
// src/components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
}

// Feature-specific skeleton — mirrors real component layout
export function CustomerCardSkeleton() {
  return (
    
      
      
      
    
  );
}

// In loading.tsx (App Router automatic Suspense)
export default function Loading() {
  return (
    
      {Array.from({ length: 6 }).map((_, i) => (
        
      ))}
    
  );
}
```

---

## 6. Empty State Pattern

Never leave an empty content area without explanation.

```tsx
// src/components/ui/empty-state.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    
      {icon && {icon}}
      {title}
      {description && (
        {description}
      )}
      {action && {action}}
    
  );
}

// Usage:
}
  title="Nenhum cliente encontrado"
  description="Comece adicionando seu primeiro cliente."
  action={Adicionar Cliente}
/>
```

---

## 7. Modal / Dialog Pattern

```tsx
// src/components/ui/modal.tsx
'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // ✅ Keyboard: Escape closes modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // click backdrop to close
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn('w-full rounded-xl bg-background p-6 shadow-xl', sizes[size])}
        onClick={(e) => e.stopPropagation()} // prevent backdrop click inside
      >
        
          {title}
          
            
          
        
        {children}
      
    
  );
}
```

---

## 8. Status Badge Pattern

```tsx
// src/components/ui/badge.tsx
const statusStyles = {
  active:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
} as const;

interface BadgeProps {
  status: keyof typeof statusStyles;
  label: string;
}

export function StatusBadge({ status, label }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>
      {label}
    
  );
}
```

---

## 9. Dark Mode Rules

Every component must work on both themes without special-casing via JavaScript:

```tsx
// ✅ Use semantic Tailwind dark: variants


// ✅ Explicit dark mode overrides when needed
Descrição

// ❌ Never use useTheme() to conditionally render different components
const { theme } = useTheme();
return theme === 'dark' ?  : ; // wrong approach
```

---

## 10. next/image — Always for Images

```tsx
import Image from 'next/image';

// ✅ Fixed dimensions (product images, avatars)


// ✅ Fill parent (hero, banner)

  


// ❌ Never use bare  — loses layout shift protection and optimization

```
