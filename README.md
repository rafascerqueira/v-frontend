# 🛒 Vendinhas Frontend

Interface web moderna para sistema de gestão de vendas, desenvolvida com Next.js 15 e React 19.

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando](#-executando)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Deploy](#-deploy)
- [Licença](#-licença)

## ✨ Funcionalidades

### Para Vendedores
- **Dashboard** com métricas de vendas em tempo real
- **Gestão de Clientes** - CRUD completo com busca e filtros
- **Gestão de Produtos** - Catálogo com imagens e categorias
- **Pedidos** - Criação e acompanhamento de pedidos
- **Cobranças** - Controle de faturamento e pagamentos
- **Estoque** - Monitoramento de níveis e alertas
- **Catálogo Público** - Link compartilhável para clientes
- **Relatórios** - Análises de vendas e desempenho

### Para Administradores
- **Painel Admin** - Dashboard administrativo separado
- **Gestão de Usuários** - Controle de contas e permissões
- **Logs de Sistema** - Auditoria e monitoramento
- **Configurações** - Parâmetros globais do sistema

### Recursos Técnicos
- **PWA** - Instalável como app nativo
- **Dark Mode** - Tema claro/escuro automático
- **Responsivo** - Mobile-first design
- **Notificações** - WebSocket em tempo real
- **Autenticação** - JWT com refresh automático

## 🛠 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 15.x | Framework React com App Router |
| React | 19.x | Biblioteca UI |
| TypeScript | 5.x | Tipagem estática |
| TailwindCSS | 4.x | Utility-first CSS |
| Framer Motion | 12.x | Animações fluidas |
| React Hook Form | 7.x | Formulários performáticos |
| Zod | 3.x | Validação de schemas |
| Axios | 1.x | Cliente HTTP |
| Socket.IO | 4.x | WebSocket para notificações |
| Lucide React | - | Ícones modernos |

## 📦 Pré-requisitos

- **Node.js** 22.x ou superior
- **pnpm** 9.x ou superior
- **Backend Vendinhas** rodando em `http://localhost:3001`

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vendinhas-frontend.git
cd vendinhas-frontend

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

Para produção, configure a URL do backend:

```env
NEXT_PUBLIC_API_URL=https://api.vendinhas.app
```

## ▶️ Executando

```bash
# Desenvolvimento (com hot reload)
pnpm dev

# Build de produção
pnpm build

# Executar produção
pnpm start

# Lint
pnpm lint
```

A aplicação estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── (admin)/            # Rotas do painel admin
│   │   └── admin/          # Dashboard, usuários, logs
│   ├── (auth)/             # Rotas de autenticação
│   │   ├── login/          # Página de login
│   │   └── register/       # Página de registro
│   ├── (dashboard)/        # Rotas do vendedor
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── customers/      # Gestão de clientes
│   │   ├── products/       # Gestão de produtos
│   │   ├── orders/         # Gestão de pedidos
│   │   ├── billings/       # Cobranças
│   │   ├── stock/          # Estoque
│   │   ├── reports/        # Relatórios
│   │   └── settings/       # Configurações
│   ├── (public)/           # Páginas públicas
│   │   ├── terms/          # Termos de uso
│   │   └── privacy/        # Política de privacidade
│   ├── catalog/            # Catálogo público
│   └── globals.css         # Estilos globais
├── components/             # Componentes reutilizáveis
│   └── ui/                 # Componentes base (Button, Card, etc)
├── contexts/               # React Contexts
│   ├── auth-context.tsx    # Autenticação e usuário
│   └── SubscriptionContext.tsx
├── hooks/                  # Custom hooks
│   ├── useNotifications.ts # WebSocket notifications
│   └── useKeyboardShortcuts.ts
├── lib/                    # Utilitários
│   ├── api.ts              # Cliente Axios configurado
│   ├── api-public.ts       # Cliente para rotas públicas
│   └── utils.ts            # Funções auxiliares
└── types/                  # Tipos TypeScript
```

## 🎨 Temas

A aplicação suporta tema claro e escuro, alternando automaticamente baseado nas preferências do sistema ou manualmente pelo usuário.

```tsx
// Uso do tema
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
setTheme("dark"); // ou "light" ou "system"
```

## 🔐 Autenticação

A autenticação é gerenciada pelo `AuthContext`:

```tsx
import { useAuth } from "@/contexts/auth-context";

function Component() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Dashboard user={user} />;
}
```

### Rotas Protegidas

- `/dashboard/*` - Requer autenticação (role: seller)
- `/admin/*` - Requer autenticação (role: admin)
- `/login`, `/register` - Públicas
- `/catalog/*` - Públicas

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

### Variáveis de Build

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:3001` |

## 📱 PWA

A aplicação é instalável como PWA:

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
