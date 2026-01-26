# Technology Stack

**Analysis Date:** 2026-01-26

## Languages

**Primary:**
- TypeScript 5.x - All source code in `src/` directory, strict type checking enabled
- JSX/TSX - React components, all files in `src/app/` and `src/components/`
- HTML/CSS - Tailwind CSS utility classes for styling

**Secondary:**
- JavaScript - Node.js server runtime for Next.js API routes

## Runtime

**Environment:**
- Node.js 24.11.1 (installed version, no `.nvmrc` specified)

**Package Manager:**
- npm 11.6.2
- Lockfile: `package-lock.json` (present, 242KB)

## Frameworks

**Core:**
- Next.js 16.1.4 - Full-stack React framework with API routes
  - Used for: Pages (`src/app/`), API routes (`src/app/api/`), server-side rendering
  - Config: `next.config.ts` (minimal configuration)

**UI/Components:**
- React 19.2.3 - Core component library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
  - PostCSS plugin: `@tailwindcss/postcss` v4
  - Config: `postcss.config.mjs`
  - Usage: Inline classes in JSX (e.g., `bg-[#050505] text-white`)

**Animation:**
- Framer Motion 12.27.5 - Motion and animation library
  - Used in: UI transitions and interactions

**Icons:**
- Lucide React 0.562.0 - Icon library
  - Used throughout components for navigation and UI elements

**Testing:**
- Not detected

**Build/Dev:**
- ESLint 9.x - Code linting
  - Config: `eslint.config.mjs`
  - Presets: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- TypeScript 5.x - Type checking and compilation

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.91.0 - Database client
  - Used for: User authentication, data queries, RPC calls
  - Clients: `src/lib/supabaseClient.ts` (anon key), `src/lib/supabaseAdmin.ts` (service role)

**Blockchain/Wallet:**
- `@tonconnect/ui-react` 2.3.1 - TON blockchain wallet integration
  - Used for: Wallet connection and verification in `src/components/TonProvider.tsx`
  - Manifest: `https://prediction-early-access.vercel.app/tonconnect-manifest.json`

**Telegram Integration:**
- `@twa-dev/sdk` 8.0.2 - Telegram Web App SDK
  - Used for: Telegram app context and user data in `src/hooks/useTelegram.tsx`
  - Script loaded via Next.js Script tag: `https://telegram.org/js/telegram-web-app.js`

**UI/Animation:**
- `canvas-confetti` 1.9.4 - Confetti animation effects
- `clsx` 2.1.1 - Conditional class name utility
- `tailwind-merge` 3.4.0 - Merge Tailwind classes without conflicts
- `@types/canvas-confetti` 1.9.0 - TypeScript types for confetti library

**Utility:**
- `@types/node` 20.x - TypeScript types for Node.js
- `@types/react` 19.x - TypeScript types for React
- `@types/react-dom` 19.x - TypeScript types for React DOM

## Configuration

**Environment:**
Configuration via `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (https://dgsihhkzjiydplruvyas.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase service role key (not in .env.local, must be set in deployment)
- `TELEGRAM_BOT_TOKEN` - Bot token for Telegram messaging API
- `CRON_SECRET` - Secret key for cron job authentication

**Build:**
- `tsconfig.json` - TypeScript compilation settings
  - Target: ES2017
  - Strict mode enabled
  - Path alias: `@/*` maps to `./src/*`
  - JSX: `react-jsx`
- `next.config.ts` - Next.js configuration (minimal)
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind

**Deployment:**
- `vercel.json` - Vercel-specific configuration
  - Cron job configured: `/api/cron/nudge` runs hourly

## Platform Requirements

**Development:**
- Node.js 24.11.1 or compatible
- npm 11.6.2 or compatible package manager
- TypeScript 5.x awareness for IDE/editor
- Git for version control

**Production:**
- Deployment target: Vercel (inferred from `vercel.json` and URL references)
- Database: Supabase (PostgreSQL-based)
- Cron jobs: Vercel cron functionality
- Telegram Bot API access required
- TON blockchain wallet infrastructure

**Browser Requirements:**
- Modern browser supporting React 19 and ES2017
- Telegram Web App support (for Telegram Mini App)
- WebApp JavaScript API from Telegram

---

*Stack analysis: 2026-01-26*
