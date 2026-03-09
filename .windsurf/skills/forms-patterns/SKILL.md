---
name: forms-patterns
description: A brief description, shown to the model to help it understand when to use this skill
---

# Skill: Forms Patterns (v-frontend)

## Purpose
Define how to build forms consistently using React Hook Form 7 + Zod 4 + `@hookform/resolvers`. Apply this skill for any form: creation, editing, filtering, login, or multi-step flows.

---

## 1. The Standard Form Template

This is the baseline for every form in the project. Adapt from here — do not start from scratch.

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createCustomerAction } from '../actions';

// ✅ Schema defined OUTSIDE the component — stable reference, no recreation on render
const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
});

type FormValues = z.infer;

export function CreateCustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  async function onSubmit(data: FormValues) {
    const result = await createCustomerAction(data);
    if (!result.success) {
      // Surface server error on a specific field when possible
      setError('email', { message: result.error });
      return;
    }
    toast.success('Cliente criado com sucesso!');
    reset();
    onSuccess?.();
  }

  return (
    
      
        
          Nome
        
        
        {errors.name && (
          
            {errors.name.message}
          
        )}
      

      
        {isSubmitting ? 'Salvando...' : 'Criar Cliente'}
      
    
  );
}
```

---

## 2. `watch()` vs `getValues()` — Critical Distinction

This is the most common performance mistake in RHF forms.

| Method | Triggers re-render | Use when |
|---|---|---|
| `watch('field')` | ✅ Yes, on every keystroke | Live UI reactions: conditional fields, live preview, character count |
| `getValues('field')` | ❌ No | Reading values inside handlers, callbacks, effects |
| `watch()` (all fields) | ✅ Yes, on every change | Avoid — subscribes to everything |

```tsx
// ❌ Re-renders on every keystroke when only needed at submit
const email = watch('email');
useEffect(() => {
  checkEmailAvailability(email);
}, [email]);

// ✅ Read inside handler — no subscription needed
async function onSubmit(data: FormValues) {
  const email = getValues('email'); // same as data.email here
}

// ✅ watch() is correct when you genuinely need live UI reaction
const planType = watch('planType');
return (
  <>
    
    {planType === 'pro' && } {/* conditional visibility */}
  </>
);
```

---

## 3. Edit Form — Populating Default Values

```tsx
interface EditCustomerFormProps {
  customer: Customer;
  onSuccess?: () => void;
}

export function EditCustomerForm({ customer, onSuccess }: EditCustomerFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    // ✅ Populate from existing data
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
    },
  });

  async function onSubmit(data: FormValues) {
    const result = await updateCustomerAction(customer.id, data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Cliente atualizado!');
    onSuccess?.();
  }

  // ... same JSX structure
}
```

---

## 4. Zod 4 Schema Patterns

```ts
import { z } from 'zod';

// ✅ String validations — always include Portuguese error messages
const nameSchema = z.string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo');

// ✅ Optional fields
const phoneSchema = z.string().optional();
// OR nullable from API:
const bioSchema = z.string().nullable();

// ✅ Enum from const object (aligned with TypeScript patterns skill)
const planSchema = z.enum(['free', 'pro', 'enterprise']);

// ✅ Monetary values — store in cents as integer, display formatted
const priceSchema = z.number()
  .int('Preço deve ser um número inteiro (centavos)')
  .positive('Preço deve ser positivo');

// ✅ Password confirmation
const passwordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Senhas não conferem', path: ['confirmPassword'] }
);

// ✅ Coerce number from input string (inputs always return strings)
const stockSchema = z.coerce.number()
  .int('Quantidade deve ser inteira')
  .min(0, 'Estoque não pode ser negativo');

// ✅ File input validation
const imageSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 5 * 1024 * 1024, 'Imagem deve ter no máximo 5MB')
  .refine(
    (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
    'Formato inválido. Use JPG, PNG ou WebP'
  );
```

---

## 5. Multi-Step Form Pattern

```tsx
'use client';

const STEPS = ['Dados Básicos', 'Endereço', 'Confirmação'] as const;
type Step = (typeof STEPS)[number];

// ✅ One schema per step — validate incrementally
const step1Schema = z.object({ name: z.string().min(2), email: z.string().email() });
const step2Schema = z.object({ city: z.string().min(2), state: z.string().length(2) });
const fullSchema = step1Schema.merge(step2Schema);

type FullFormValues = z.infer;

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    resolver: zodResolver(fullSchema),
    mode: 'onBlur', // validate on blur for multi-step
  });

  async function goNext() {
    // Validate only current step fields before advancing
    const stepFields = currentStep === 0
      ? (['name', 'email'] as const)
      : (['city', 'state'] as const);

    const isValid = await form.trigger(stepFields);
    if (isValid) setCurrentStep((s) => s + 1);
  }

  return (
    
      
      {currentStep === 0 && }
      {currentStep === 1 && }
      {currentStep === 2 && }
      <StepNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onBack={() => setCurrentStep((s) => s - 1)}
        onNext={goNext}
        isSubmitting={form.formState.isSubmitting}
      />
    
  );
}
```

---

## 6. Search / Filter Form (no submit button)

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { useCallback } from 'react';

interface FilterValues {
  search: string;
  status: string;
}

export function CustomerFilters({ onChange }: { onChange: (values: FilterValues) => void }) {
  const { register, watch } = useForm({
    defaultValues: { search: '', status: 'all' },
  });

  // ✅ watch() is correct here — we genuinely need live reaction to drive the parent
  const values = watch();

  // Debounce to avoid triggering on every keystroke
  const debouncedOnChange = useCallback(
    debounce((v: FilterValues) => onChange(v), 300),
    [onChange]
  );

  useEffect(() => {
    debouncedOnChange(values);
  }, [values, debouncedOnChange]);

  return (
    
      
      
        Todos
        Ativos
        Inativos
      
    
  );
}
```

---

## 7. Server-Side Validation Errors → Form Fields

Map backend validation errors back to specific form fields:

```ts
async function onSubmit(data: FormValues) {
  const result = await createCustomerAction(data);

  if (!result.success) {
    // If backend returns field-level errors
    if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([field, message]) => {
        setError(field as keyof FormValues, { message });
      });
      return;
    }
    // General error
    toast.error(result.error);
  }
}
```

---

## 8. Accessibility Checklist for Forms

Every form field must have:

```tsx
// ✅ Explicit label with htmlFor matching input id
E-mail


// ✅ aria-invalid when field has error


// ✅ aria-describedby linking to error message

{errors.email?.message}

// ✅ Disabled state on submit button during loading

  {isSubmitting ? 'Salvando...' : 'Salvar'}

```

---

## 9. Form Mode Selection

```ts
// RHF validates at different moments based on `mode`:
useForm({ mode: 'onSubmit' })  // default — validates only on submit (best UX for simple forms)
useForm({ mode: 'onBlur' })    // validates when field loses focus (good for multi-step)
useForm({ mode: 'onChange' })  // validates on every keystroke — avoid, causes re-renders
useForm({ mode: 'onTouched' }) // validates on first blur, then on every change
```

Prefer `onSubmit` (default) for simple forms, `onBlur` for multi-step.
