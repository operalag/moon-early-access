# Coding Conventions

**Analysis Date:** 2026-01-26

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `WelcomeScreen.tsx`, `DailyLoginCard.tsx`, `AuthWrapper.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTelegram.tsx`, `useDailyLogin.tsx`, `useProgression.ts`)
- Utilities/Libraries: camelCase (e.g., `supabaseClient.ts`, `megaphone.ts`, `pointsEngine.ts`)
- Pages: lowercase with hyphens in directory names (e.g., `src/app/leaderboard/page.tsx`, `src/app/chat/page.tsx`)
- API routes: lowercase with hyphens (e.g., `/api/auth/welcome/route.ts`, `/api/daily-spin/route.ts`)

**Functions:**
- camelCase for all functions and async handlers (e.g., `fetchData()`, `checkLoginStatus()`, `claimDailyReward()`)
- Prefix async handlers with `handle` or `fetch` (e.g., `handleReferral()`, `handleStart()`, `fetchData()`)
- Helper functions: `get` prefix (e.g., `getWeightedPrize()`, `getRandomNudge()`, `getMumbaiDate()`)

**Variables:**
- camelCase for all variables and state (e.g., `hasStarted`, `isChecking`, `isWalletConnected`)
- Boolean variables prefixed with `is`, `has`, `can`, `should` (e.g., `isLoading`, `hasJoinedChannel`, `isWalletConnected`)
- State variables without special prefix (e.g., `stats`, `streak`, `rank`)

**Types & Interfaces:**
- PascalCase for all types, interfaces, and enums (e.g., `TelegramContextType`, `WelcomeProps`, `Referral`, `LeaderboardEntry`, `Message`)
- Use `type` keyword for simple unions and object types (e.g., `type PointReason`, `type Message`)
- Use `interface` keyword for context providers and component props

**Constants:**
- SCREAMING_SNAKE_CASE for constants (e.g., `PRIZES`, `NEXT_PUBLIC_SUPABASE_URL`)

## Code Style

**Formatting:**
- No explicit formatter configured (no Prettier config found)
- Semicolons required at end of statements
- Standard spacing: 2 spaces per indent level
- Single quotes for strings (e.g., `'use client'`, `'0.1.0'`)

**Linting:**
- ESLint v9 configured with Next.js web vitals and TypeScript presets
- Config file: `eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Run with: `npm run lint`

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Target: ES2017
- Module: esnext
- Path aliases: `@/*` maps to `./src/*`
- Use `type` imports for types: `import type { Metadata } from "next"`

## Import Organization

**Order:**
1. External libraries (e.g., `import { NextResponse } from 'next/server'`)
2. Next.js modules and utilities (e.g., `import Link from 'next/link'`, `import Script from 'next/script'`)
3. React and third-party UI libraries (e.g., `import { useState, useEffect } from 'react'`, `import { motion } from 'framer-motion'`)
4. Internal library utilities (e.g., `import { supabase } from '@/lib/supabaseClient'`, `import { awardPoints } from '@/lib/pointsEngine'`)
5. Internal hooks (e.g., `import { useTelegram } from '@/hooks/useTelegram'`)
6. Internal components (e.g., `import AuthWrapper from '@/components/AuthWrapper'`)
7. Internal context providers (e.g., `import { TelegramProvider } from '@/hooks/useTelegram'`)
8. Icons from lucide-react (e.g., `import { Zap, Trophy, Users } from 'lucide-react'`)

Example from `src/app/page.tsx`:
```typescript
import AuthWrapper from "@/components/AuthWrapper";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DailyLoginCard from "@/components/DailyLoginCard";
import InfoTrigger from "@/components/ui/InfoTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Users, Wallet, TrendingUp } from "lucide-react";
```

**Path Aliases:**
- Always use `@/` prefix for internal imports (e.g., `@/components/`, `@/lib/`, `@/hooks/`, `@/context/`)
- Never use relative paths like `../` or `./`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations in API routes and async functions
- Console.error() for logging errors with descriptive context
- NextResponse.json() for API responses with status codes
- Conditional checks before operations (e.g., `if (!user) return`)
- Error messages passed to client in JSON responses

**Pattern Example from `src/app/api/referral/route.ts`:**
```typescript
try {
  const { referrerId, refereeId } = await request.json();

  if (!referrerId || !refereeId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Logic here

} catch (error: any) {
  console.error('Referral API Error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**Client Error Handling:**
- Check error codes (e.g., `error.code === 'PGRST116'` for Supabase not found)
- Graceful fallbacks with state management
- User-facing toast/status messages for referral and auth flows

## Logging

**Framework:** console (built-in)

**Patterns:**
- Use `console.error()` for error conditions with context prefix (e.g., `console.error('Welcome API Error:', error)`)
- Use `console.warn()` for development notices (e.g., `console.warn("MOON: Running in Dev Mode (Mock User)")`)
- Typically only error and warning logs; no info/debug logs in production code
- Context prefixes in log messages aid debugging (e.g., `'Megaphone Engine Error:'`, `'Leaderboard fetch error:'`)

## Comments

**When to Comment:**
- Explain complex business logic (e.g., megaphone logic in `src/lib/megaphone.ts`)
- Document non-obvious timestamp/timezone handling (e.g., Mumbai midnight logic in `src/app/api/spin/route.ts`)
- Document RLS bypasses and admin operations (e.g., "Admin Read", "Admin Write - Bypasses RLS")
- Numbered steps for multi-stage operations (e.g., "1. Sync Profile", "2. Handle Referral")
- Document data transformation logic

**JSDoc/TSDoc:**
- Not extensively used in codebase
- Comments are inline numbered steps rather than JSDoc blocks
- Type annotations replace documentation for function signatures

**Pattern from `src/app/api/spin/route.ts`:**
```typescript
// Helper: Get today's date in Mumbai Time (YYYY-MM-DD)
const getMumbaiDate = (dateStr?: string) => {
  // ...
};

export async function POST(request: Request) {
  try {
    // 1. Fetch Profile (Check Limit)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('last_spin_at, telegram_id')
      // ...

    // 2. Validate Time (Mumbai Midnight)
    if (profile.last_spin_at) {
      // ...
    }
```

## Function Design

**Size:** Functions are typically 15-60 lines for feature components, 5-40 lines for utility functions. Inline async handlers keep related logic together.

**Parameters:**
- Props destructured in function signatures (e.g., `function Dashboard() { const { user } = useTelegram()` instead of passing as params)
- Event handlers receive single event object (e.g., `onClick={handleStart}`)
- Async functions accept request/data objects and return structured responses

**Return Values:**
- Components return JSX
- Hooks return object with state and handlers (e.g., `{ loading, hasClaimedToday, streak, claimDailyReward, showModal, setShowModal }`)
- API routes return `NextResponse.json()` with status codes
- Utility functions return data or void

**Pattern from `src/hooks/useDailyLogin.tsx`:**
```typescript
return { loading, hasClaimedToday, streak, claimDailyReward, showModal, setShowModal };
```

## Module Design

**Exports:**
- Default exports for page components and main components (e.g., `export default function Dashboard()`)
- Named exports for providers and hooks (e.g., `export const useTelegram = () => useContext(TelegramContext)`)
- Named exports for utility functions (e.g., `export async function awardPoints()`)
- Named and default exports for contexts (e.g., `export function InfoProvider` and `export const useInfo`)

**Barrel Files:**
- Not used; direct imports from specific files (e.g., `import { useTelegram } from '@/hooks/useTelegram'` not from an index)

**File Structure per Type:**
- Components: Single component per file with local state
- Hooks: Export hook function and context provider (if applicable) in same file
- Pages: Single page per directory with layout
- API Routes: Single route handler per file
- Utilities: Single function or related utilities per file

## React & Next.js Conventions

**Client Components:**
- Use `'use client'` directive at top of client-side files
- Server components by default (no directive needed)
- Page components are server components; nested components are client

**Hooks Usage:**
- `useState` for local component state
- `useEffect` for side effects with dependency arrays
- Custom hooks for reusable logic (`useTelegram()`, `useDailyLogin()`)
- Context hooks via `useContext()` and custom hook wrappers

**Next.js Features:**
- App Router with nested layouts
- API routes in `src/app/api/` with `route.ts` files
- Server-side context providers for authentication and global state
- Dynamic imports not observed; statically imported

## Styling

**Framework:** Tailwind CSS v4 with PostCSS

**Patterns:**
- Utility classes for all styles (no CSS modules observed)
- Arbitrary values for custom colors (e.g., `bg-[#050505]`, `shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]`)
- Color scheme: dark theme with yellow-500 accents, white/transparency for contrast
- Responsive design via Tailwind breakpoints (mobile-first, no explicit md: prefix usage observed)
- Rounded corners consistently using Tailwind (e.g., `rounded-[32px]`, `rounded-xl`, `rounded-full`)

---

*Convention analysis: 2026-01-26*
