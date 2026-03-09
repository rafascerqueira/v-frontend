# 🛒 Vendinhas Frontend

Interface web moderna para o sistema SaaS de gestão de vendas **Vendinhas**, desenvolvida com Next.js 16 e React 19.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-2.x-60A5FA?logo=biome)](https://biomejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Qualidade de Código](#-qualidade-de-código)
- [CI/CD](#-cicd)
- [Deploy](#-deploy)
- [Licença](#-licença)

## ✨ Funcionalidades

### Para Vendedores

- **Dashboard** — métricas de vendas em tempo real com gráficos (Recharts)
- **Gestão de Clientes** — CRUD completo com busca e filtros
- **Gestão de Produtos** — catálogo com imagens e categorias
- **Pedidos** — criação e acompanhamento com status em tempo real
- **Cobranças** — controle de faturamento e pagamentos
- **Estoque** — monitoramento de níveis com alertas de estoque baixo
- **Promoções** — criação e gestão de campanhas promocionais
- **Fornecedores** — cadastro e gestão de fornecedores
- **Combos/Kits** — montagem de bundles de produtos
- **Catálogo Público** — link compartilhável para clientes com checkout
- **Planos** — visualização e gestão de assinatura
- **Relatórios** — análises de vendas e desempenho

### Para Administradores

- **Painel Admin** — dashboard administrativo separado
- **Gestão de Usuários** — controle de contas e permissões
- **Logs de Sistema** — auditoria e monitoramento de atividades
- **Configurações** — parâmetros globais do sistema

### Recursos Técnicos

- **PWA** — instalável como app nativo
- **Dark Mode** — tema claro/escuro com suporte completo em todos os componentes
- **Responsivo** — design mobile-first
- **Notificações** — WebSocket em tempo real via Socket.IO
- **Autenticação** — JWT com refresh automático e retry em 429
- **Multi-tenant** — dados isolados por vendedor via JWT do backend

## 🛠 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 16.x | Framework React com App Router (SSR + RSC) |
| React | 19.x | Biblioteca UI |
| TypeScript | 5.x | Tipagem estática (strict) |
| TailwindCSS | 4.x | Utility-first CSS com design tokens |
| Biome | 2.x | Linter e formatter (substitui ESLint + Prettier) |
| Framer Motion | 12.x | Animações fluidas |
| React Hook Form | 7.x | Formulários performáticos |
| Zod | 4.x | Validação de schemas |
| Axios | 1.x | Cliente HTTP com interceptors (retry 429, refresh 401) |
| Recharts | 3.x | Gráficos e visualizações |
| Socket.IO Client | 4.x | WebSocket para notificações |
| react-hot-toast | 2.x | Notificações toast |
| next-themes | 0.4.x | Gerenciamento de tema claro/escuro |
| tailwind-merge | 3.x | Composição inteligente de classes (via `cn()`) |
| js-cookie | 3.x | Cookies de preferências do cliente (não auth) |
| Lucide React | latest | Ícones |
| @ducanh2912/next-pwa | 10.x | Progressive Web App |

## 📦 Pré-requisitos

- **Node.js** 22.x ou superior
- **pnpm** 9.x ou superior
- **Backend Vendinhas** ([v-backend](https://github.com/rafascerqueira/v-backend)) rodando em `http://localhost:3001`

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/rafascerqueira/v-frontend.git
cd v-frontend

# Instale as dependências
pnpm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Para produção:

```env
NEXT_PUBLIC_API_URL=https://api.vendinhas.app
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:3001` |

## ▶️ Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento com hot reload (http://localhost:3000)
pnpm build        # Build de produção
pnpm start        # Executar build de produção
pnpm lint         # Verificar lint (Biome check)
pnpm lint:fix     # Corrigir problemas de lint automaticamente
pnpm format       # Formatar código (Biome format)
```

## 📁 Estrutura do Projeto

```
src/
├── app/                        # App Router (Next.js 16)
│   ├── (admin)/                # Rotas do painel admin
│   │   └── admin/              # Dashboard, usuários, logs, configurações
│   ├── (auth)/                 # Autenticação
│   │   ├── login/              # Login
│   │   ├── register/           # Registro
│   │   ├── forgot-password/    # Recuperação de senha
│   │   └── reset-password/     # Redefinição de senha
│   ├── (dashboard)/            # Rotas do vendedor (autenticadas)
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── customers/          # Gestão de clientes
│   │   ├── products/           # Gestão de produtos
│   │   ├── orders/             # Gestão de pedidos
│   │   ├── billings/           # Cobranças
│   │   ├── stock/              # Estoque
│   │   ├── promotions/         # Promoções
│   │   ├── suppliers/          # Fornecedores
│   │   ├── bundles/            # Combos/Kits
│   │   ├── catalog-share/      # Compartilhamento de catálogo
│   │   ├── plans/              # Planos de assinatura
│   │   ├── reports/            # Relatórios
│   │   └── settings/           # Configurações do vendedor
│   ├── (landing)/              # Landing page pública
│   ├── (public)/               # Páginas institucionais
│   │   ├── terms/              # Termos de uso
│   │   ├── privacy/            # Política de privacidade
│   │   └── ...                 # About, blog, contact, docs, etc.
│   ├── catalog/                # Catálogo público com checkout
│   ├── error.tsx               # Boundary de erro global
│   ├── loading.tsx             # Fallback de carregamento global
│   ├── not-found.tsx           # Página 404
│   └── globals.css             # Tokens de design e estilos globais
├── components/
│   ├── ui/                     # Primitivos reutilizáveis
│   │   ├── alert.tsx           # Alertas com variantes de cor
│   │   ├── badge.tsx           # Badges com variantes
│   │   ├── button.tsx          # Botão com variantes e tamanhos
│   │   ├── card.tsx            # Card com header/content/footer
│   │   ├── input.tsx           # Input com label, erro e hint
│   │   ├── currency-input.tsx  # Input monetário (R$)
│   │   ├── modal.tsx           # Modal com overlay
│   │   ├── table.tsx           # Tabela com header/body/row/cell
│   │   ├── pagination.tsx      # Paginação
│   │   ├── skeleton.tsx        # Skeletons de carregamento
│   │   └── ...                 # toast, breadcrumbs, theme-toggle, etc.
│   ├── subscription/           # Componentes de planos/limites
│   │   ├── UpgradeBanner.tsx   # Banner de upgrade de plano
│   │   ├── UsageCard.tsx       # Card de uso de recursos
│   │   └── LimitNotification.tsx
│   ├── page-transition.tsx     # Transição entre páginas (Framer Motion)
│   └── theme-provider.tsx      # Provider de tema (next-themes)
├── contexts/
│   ├── auth-context.tsx        # Autenticação, user, planType
│   ├── SubscriptionContext.tsx # Estado de assinatura
│   └── CartContext.tsx         # Carrinho do catálogo público
├── hooks/
│   ├── useNotifications.ts     # WebSocket (Socket.IO)
│   ├── useKeyboardShortcuts.ts # Atalhos de teclado
│   └── useExport.ts           # Exportação de dados
├── lib/
│   ├── api.ts                  # Axios com credentials + retry 429 + refresh 401
│   ├── api-public.ts           # Axios para rotas públicas (sem credentials)
│   ├── utils.ts                # cn(), formatCurrency(), helpers
│   └── validators.ts           # Schemas Zod compartilhados
└── types/                      # Tipos TypeScript compartilhados
```

## 🎨 Temas

A aplicação suporta tema claro e escuro com cobertura completa em todos os componentes. O tema pode ser alternado manualmente ou seguir as preferências do sistema.

```tsx
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
setTheme("dark"); // "light" | "dark" | "system"
```

Todos os componentes utilizam variantes `dark:` do Tailwind. Classes dinâmicas são compostas com o helper `cn()` (`clsx` + `tailwind-merge`).

## 🔐 Autenticação

A autenticação é gerenciada pelo `AuthContext` com JWT via HttpOnly cookies:

```tsx
import { useAuth } from "@/contexts/auth-context";

function Component() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  // user.planType controla feature gating
  // isAdmin controla acesso ao painel administrativo
}
```

### Fluxo de Auth

1. Login via `/auth/login` → backend seta HttpOnly cookies (access + refresh)
2. `api.ts` envia cookies automaticamente (`withCredentials: true`)
3. Em caso de 401, o interceptor tenta refresh via `/auth/refresh`
4. Em caso de 429 (rate limit), retry com backoff exponencial (até 3x)

### Rotas Protegidas

| Rota | Acesso |
|------|--------|
| `/dashboard/*` | Autenticado (role: seller) |
| `/admin/*` | Autenticado (role: admin) |
| `/login`, `/register` | Público |
| `/catalog/*` | Público |
| `/`, `/terms`, `/privacy` | Público |

## ✅ Qualidade de Código

O projeto usa **Biome** como linter e formatter (não ESLint/Prettier).

```bash
pnpm lint         # Biome check (lint + análise)
pnpm lint:fix     # Auto-fix de problemas
pnpm format       # Formatação automática
```

### Regras

- Zero `any` — todos os tipos devem ser explícitos
- Zero `console.log` fora de guards de desenvolvimento
- Zero imports não utilizados
- Ordenação de imports gerenciada pelo Biome
- Formatação automática com Biome (não configurar Prettier)

## 🔄 CI/CD

### GitHub Actions

O workflow de CI (`.github/workflows/ci.yml`) executa em paralelo:

| Job | Steps |
|-----|-------|
| **quality** | Biome format check → Biome lint |
| **build** | Install → Restore Next.js cache → Build |

Disparado em push/PR para `main` e `develop`. Runs duplicados são cancelados automaticamente via `concurrency`.

## 🐳 Deploy

### Docker

```bash
# Build da imagem
docker build -t vendinhas-frontend .

# Executar container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.vendinhas.app \
  vendinhas-frontend
```

## 📱 PWA

A aplicação é instalável como PWA (via `@ducanh2912/next-pwa`):

1. Acesse a aplicação no navegador
2. Clique em "Instalar" no banner ou menu do navegador
3. A aplicação funcionará offline com cache de recursos

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Busca global |
| `Ctrl + /` | Mostrar atalhos |
| `Esc` | Fechar modais |

---

## Licença

[MIT](LICENSE).
