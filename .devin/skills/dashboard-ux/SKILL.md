---
name: dashboard-ux
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: Dashboard UX Patterns (v-frontend)

## Purpose
Define UX structure and component recipes for the seller dashboard. Covers metrics, tables, charts, modals, and interaction patterns that are specific to Vendinhas.

---

## 1. Dashboard Metrics Grid — Recharts + KPI Cards

```tsx
// src/app/(dashboard)/dashboard/components/metrics-grid.tsx
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCard {
  title: string;
  value: string;
  change: number; // percentage, positive = up, negative = down
  icon: React.ReactNode;
}

function KPICard({ title, value, change, icon }: MetricCard) {
  const isPositive = change >= 0;

  return (
    
      
        {title}
        {icon}
      
      {value}
      
        {isPositive ?  : }
        {Math.abs(change)}% em relação ao mês anterior
      
    
  );
}

export function MetricsGrid({ metrics }: { metrics: DashboardMetrics }) {
  return (
    
      }
      />
      }
      />
      }
      />
      }
      />
    
  );
}
```

---

## 2. Recharts — Revenue Chart Template

```tsx
// src/app/(dashboard)/dashboard/components/revenue-chart.tsx
'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data: Array;
}

// ✅ Define outside component — stable reference
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    
      {label}
      {formatCurrency(payload[0].value)}
    
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    
      Receita Mensal
      
        
          
            
              
              
            
          
          
          
          <YAxis
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          } />
          
        
      
    
  );
}
```

---

## 3. Data Table Pattern

```tsx
// src/app/(dashboard)/customers/components/customer-table.tsx
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
  return (
    
      
        
          
            Nome
            E-mail
            Status
            Ações
          
        
        
          {customers.map((customer) => (
            // ✅ Always use customer.id as key — never index
            
              {customer.name}
              {customer.email}
              
                <StatusBadge
                  status={customer.status as any}
                  label={customer.status === 'active' ? 'Ativo' : 'Inativo'}
                />
              
              
                
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer.id)}
                    aria-label={`Editar ${customer.name}`}
                  >
                    
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(customer.id)}
                    aria-label={`Remover ${customer.name}`}
                    className="text-destructive hover:text-destructive"
                  >
                    
                  
                
              
            
          ))}
        
      
    
  );
}
```

---

## 4. Page Header Pattern

Consistent across all dashboard pages:

```tsx
// src/components/ui/page-header.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    
      
        {title}
        {description && (
          {description}
        )}
      
      {action && {action}}
    
  );
}

// Usage — every page starts with this:
Novo Cliente}
/>
```

---

## 5. CRUD Page Full Structure

This is the canonical pattern for every CRUD feature page:

```tsx
// src/app/(dashboard)/customers/page.tsx
import { Suspense } from 'react';
import { customersService } from './services';
import { PageHeader } from '@/components/ui/page-header';
import { CustomerListClient } from './components/customer-list-client';
import { TableSkeleton } from '@/components/ui/skeleton';

export default async function CustomersPage() {
  const initialData = await customersService.list({ page: 1 });

  return (
    
      
      }>
        {/* Pass initial SSR data; client takes over for interactions */}
        
      
    
  );
}
```

---

## 6. Confirmation Dialog for Destructive Actions

Never delete without confirmation:

```tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteProps {
  entityName: string;
  onConfirm: () => Promise;
}

export function useConfirmDelete() {
  const [target, setTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function requestDelete(id: string, name: string) {
    setTarget({ id, name });
  }

  function ConfirmDeleteModal({ onConfirm }: { onConfirm: (id: string) => Promise }) {
    async function handleConfirm() {
      if (!target) return;
      setIsDeleting(true);
      await onConfirm(target.id);
      setIsDeleting(false);
      setTarget(null);
    }

    return (
      <Modal
        isOpen={!!target}
        onClose={() => setTarget(null)}
        title="Confirmar exclusão"
        size="sm"
      >
        
          Tem certeza que deseja excluir {target?.name}? Esta ação não pode ser desfeita.
        
        
          <Button variant="outline" onClick={() => setTarget(null)}>
            Cancelar
          
          
            Excluir
          
        
      
    );
  }

  return { requestDelete, ConfirmDeleteModal };
}
```

---

## 7. Currency and Number Formatting

```ts
// src/lib/utils.ts

// ✅ Always format currency in pt-BR — backend stores values in cents
export function formatCurrency(
  cents: number,
  options: { compact?: boolean } = {}
): string {
  const value = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: options.compact ? 'compact' : 'standard',
  }).format(value);
}

// ✅ Format dates in pt-BR
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

// ✅ Relative time (e.g., "há 3 horas")
export function formatRelativeTime(dateString: string): string {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diff = (new Date(dateString).getTime() - Date.now()) / 1000;
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minutes');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hours');
  return rtf.format(Math.round(diff / 86400), 'days');
}
```

---

## 8. Framer Motion — Consistent Animation Tokens

```tsx
// src/lib/motion.ts — shared motion variants to keep animations consistent
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.2 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.15 },
};

// Usage — consistent across all modals, drawers, and page transitions:
import { motion } from 'framer-motion';
import { slideUp } from '@/lib/motion';


  

```

---

## 9. Plan Limit Warning in Feature Pages

When a user is approaching or at a plan limit, surface it inline — not just as a toast:

```tsx
// src/app/(dashboard)/products/components/plan-limit-banner.tsx
interface PlanLimitBannerProps {
  current: number;
  max: number;
  entity: string; // "produtos", "clientes"
  planType: PlanType;
}

export function PlanLimitBanner({ current, max, entity, planType }: PlanLimitBannerProps) {
  const percentage = (current / max) * 100;

  if (percentage < 80) return null; // Only show when close to limit

  const isAtLimit = current >= max;

  return (
    <div className={cn(
      'rounded-lg p-4 text-sm',
      isAtLimit
        ? 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400'
        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
    )}>
      {isAtLimit
        ? `Você atingiu o limite de ${max} ${entity} do plano ${planType}. `
        : `Você está usando ${current} de ${max} ${entity} disponíveis. `}
      
        Fazer upgrade para continuar →
      
    
  );
}
```
