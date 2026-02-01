# Phase 9: Analytics Dashboard - Research

**Researched:** 2026-02-01
**Domain:** React Dashboard with Charting, Admin Route Protection, Supabase Analytics Queries
**Confidence:** HIGH

## Summary

This phase involves building an admin analytics dashboard to visualize app growth metrics. The existing codebase provides rich data sources: `profiles` table (user acquisition, wallet connections, activity), `transactions` table (points economy ledger with reasons like daily_spin, referral, wallet_connect), `referrals` table (network tracking), `campaign_attributions` table (marketing performance), and `leaderboard_buckets` table (daily/weekly aggregations).

The standard approach for React dashboards in 2026 is Recharts (v3.6.0), a declarative charting library built on React and D3. It integrates seamlessly with Next.js App Router using client components. For admin route protection, since this is a Telegram Mini App without traditional auth, we will use a simple allowlist approach checking the Telegram user ID against a list of admin IDs.

**Primary recommendation:** Use Recharts 3.6 for all visualizations, implement a simple admin ID allowlist for route protection, and build SQL queries directly in Supabase for analytics aggregations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | ^3.6.0 | Charting library | Most popular React charting lib, declarative API, minimal deps, tree-shakeable |
| date-fns | ^4.1.0 | Date manipulation | Modular, tree-shakeable, TypeScript-first, handles timezone well |
| @uiw/react-heat-map | ^2.3.0 | Activity heatmaps | Lightweight GitHub-style calendar heatmaps, perfect for engagement visualization |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-csv | ^2.2.2 | CSV export | When user wants to download data for reporting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | nivo | nivo has more chart types but larger bundle, steeper learning curve |
| Recharts | ApexCharts | ApexCharts better for real-time, but Recharts simpler for static dashboards |
| @uiw/react-heat-map | Custom D3 | Custom gives more control but significantly more code |
| react-csv | Native Blob API | Native is zero-dep but react-csv handles edge cases |

**Installation:**
```bash
npm install recharts date-fns @uiw/react-heat-map react-csv
npm install -D @types/react-csv
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Admin layout with protection check
│       ├── page.tsx            # Dashboard overview (redirect to /admin/dashboard)
│       └── dashboard/
│           └── page.tsx        # Main analytics dashboard
├── components/
│   └── admin/
│       ├── AdminGuard.tsx      # Route protection component
│       ├── MetricCard.tsx      # Single stat display
│       ├── charts/
│       │   ├── UserGrowthChart.tsx
│       │   ├── EngagementHeatmap.tsx
│       │   ├── WalletFunnel.tsx
│       │   ├── RetentionChart.tsx
│       │   ├── CampaignTable.tsx
│       │   └── PointsEconomyChart.tsx
│       └── DateRangePicker.tsx # Date range selector
├── lib/
│   └── analytics/
│       ├── queries.ts          # Supabase analytics queries
│       └── transforms.ts       # Data transformation for charts
└── api/
    └── admin/
        └── analytics/
            ├── overview/route.ts     # Summary metrics
            ├── users/route.ts        # User acquisition
            ├── engagement/route.ts   # Activity heatmap data
            ├── funnel/route.ts       # Wallet funnel
            ├── retention/route.ts    # D1/D7/D30 curves
            ├── campaigns/route.ts    # Campaign performance
            └── points/route.ts       # Points economy
```

### Pattern 1: Admin Route Protection (Allowlist)
**What:** Simple admin ID check without external auth libraries
**When to use:** Telegram Mini Apps where users are already authenticated via initData
**Example:**
```typescript
// lib/adminConfig.ts
export const ADMIN_TELEGRAM_IDS = [
  458184707,  // Primary admin
  // Add more admin IDs as needed
];

export function isAdmin(telegramId: number | undefined): boolean {
  if (!telegramId) return false;
  return ADMIN_TELEGRAM_IDS.includes(telegramId);
}
```

```typescript
// components/admin/AdminGuard.tsx
'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { isAdmin } from '@/lib/adminConfig';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAdmin(user.id)) {
      router.replace('/');
    }
  }, [user, router]);

  if (!user || !isAdmin(user.id)) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-red-500 font-bold">Access Denied</div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Pattern 2: Recharts Client Component
**What:** Chart components must use 'use client' directive
**When to use:** All Recharts components in Next.js App Router
**Example:**
```typescript
// components/admin/charts/UserGrowthChart.tsx
'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DataPoint {
  date: string;
  total: number;
  dau: number;
}

export function UserGrowthChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
        />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#eab308" name="Total Users" />
        <Line type="monotone" dataKey="dau" stroke="#22c55e" name="DAU" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 3: Analytics API Route with Admin Check
**What:** Server-side admin validation before returning sensitive data
**When to use:** All admin API routes
**Example:**
```typescript
// app/api/admin/analytics/overview/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  // Note: In production, validate initData on server-side
  // For MVP, admin check happens client-side via AdminGuard

  try {
    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Wallet connections
    const { count: walletsConnected } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_wallet_connected', true);

    // Total points distributed
    const { data: pointsData } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .gt('amount', 0);

    const totalPointsDistributed = pointsData?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Total referrals
    const { count: totalReferrals } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalUsers,
      walletsConnected,
      walletConversionRate: totalUsers ? ((walletsConnected || 0) / totalUsers * 100).toFixed(1) : 0,
      totalPointsDistributed,
      totalReferrals
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Pattern 4: Retention Cohort Query
**What:** SQL pattern for D1/D7/D30 retention calculation
**When to use:** Retention curves visualization
**Example:**
```typescript
// lib/analytics/queries.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getRetentionData() {
  // Get users with their signup date and last activity
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('telegram_id, created_at, last_active_at');

  if (!data) return [];

  // Group by signup cohort (week)
  const cohorts = new Map<string, { signups: number; d1: number; d7: number; d30: number }>();

  for (const user of data) {
    const signupDate = new Date(user.created_at);
    const cohortKey = getWeekKey(signupDate);

    if (!cohorts.has(cohortKey)) {
      cohorts.set(cohortKey, { signups: 0, d1: 0, d7: 0, d30: 0 });
    }

    const cohort = cohorts.get(cohortKey)!;
    cohort.signups++;

    if (user.last_active_at) {
      const lastActive = new Date(user.last_active_at);
      const daysSinceSignup = Math.floor(
        (lastActive.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceSignup >= 1) cohort.d1++;
      if (daysSinceSignup >= 7) cohort.d7++;
      if (daysSinceSignup >= 30) cohort.d30++;
    }
  }

  return Array.from(cohorts.entries()).map(([week, data]) => ({
    cohort: week,
    signups: data.signups,
    d1: (data.d1 / data.signups * 100).toFixed(1),
    d7: (data.d7 / data.signups * 100).toFixed(1),
    d30: (data.d30 / data.signups * 100).toFixed(1)
  }));
}

function getWeekKey(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}
```

### Anti-Patterns to Avoid
- **Fetching all data client-side:** Always aggregate on server/database level, not in browser
- **Using SSR for charts:** Recharts requires DOM access; always use 'use client'
- **Hardcoding date ranges:** Use date-fns for all date calculations
- **Complex SQL in API routes:** Extract queries to lib/analytics/queries.ts
- **No loading states:** Always show skeleton/spinner while fetching

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date range calculations | Manual date math | date-fns (eachDayOfInterval, subDays, format) | Timezone bugs, leap years, DST |
| CSV export | Blob generation | react-csv CSVLink | Handles escaping, special chars, BOM |
| Responsive charts | CSS breakpoints + resize | Recharts ResponsiveContainer | Automatic SVG scaling |
| Heatmap calendar | Custom SVG grid | @uiw/react-heat-map | Week alignment, hover states |
| Data aggregation | Client-side reduce | Supabase aggregate queries | Performance, memory |

**Key insight:** Dashboard performance depends on server-side aggregation. Fetch summaries, not raw data.

## Common Pitfalls

### Pitfall 1: Chart Hydration Errors
**What goes wrong:** "Hydration mismatch" errors when using Recharts with Next.js SSR
**Why it happens:** Recharts uses D3 which needs DOM; server has no DOM
**How to avoid:** Always use 'use client' directive for chart components
**Warning signs:** Error mentions "expected server HTML to contain" or "hydration failed"

### Pitfall 2: Large Dataset Performance
**What goes wrong:** Dashboard becomes slow with thousands of users
**Why it happens:** Fetching all records instead of aggregated summaries
**How to avoid:** Use COUNT(), SUM(), GROUP BY in Supabase queries; limit to date ranges
**Warning signs:** API response > 1MB, chart takes > 2s to render

### Pitfall 3: Missing Date Boundaries
**What goes wrong:** Retention/DAU calculations include future dates or incorrect ranges
**Why it happens:** Not properly truncating dates, timezone mismatches
**How to avoid:** Use date-fns startOfDay/endOfDay, always work in UTC
**Warning signs:** DAU shows 0 for "today", cohorts have overlapping weeks

### Pitfall 4: Funnel Denominator Issues
**What goes wrong:** Conversion rates > 100% or negative
**Why it happens:** Using wrong base for each funnel stage
**How to avoid:** Each stage's rate = (stage count / previous stage count) * 100
**Warning signs:** Math doesn't add up, users "appear" between stages

### Pitfall 5: Admin Route Exposure
**What goes wrong:** Non-admins can access dashboard via direct URL
**Why it happens:** Only hiding UI link, not protecting route
**How to avoid:** AdminGuard component wraps all admin pages; API routes also validate
**Warning signs:** Dashboard accessible when logged in as regular user

## Code Examples

Verified patterns from official sources:

### Metric Card Component
```typescript
// components/admin/MetricCard.tsx
'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, change, trend }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-500' :
                     trend === 'down' ? 'text-red-500' : 'text-zinc-500';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${trendColor}`}>{change}</p>
      )}
    </div>
  );
}
```

### Engagement Heatmap
```typescript
// components/admin/charts/EngagementHeatmap.tsx
'use client';

import HeatMap from '@uiw/react-heat-map';

interface HeatmapData {
  date: string;
  count: number;
}

export function EngagementHeatmap({ data }: { data: HeatmapData[] }) {
  return (
    <HeatMap
      value={data}
      weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
      startDate={new Date('2026-01-01')}
      endDate={new Date()}
      rectSize={14}
      space={4}
      rectProps={{
        rx: 2,
      }}
      panelColors={{
        0: '#161b22',
        2: '#0e4429',
        4: '#006d32',
        8: '#26a641',
        12: '#39d353',
      }}
    />
  );
}
```

### Funnel Chart for Wallet Conversion
```typescript
// components/admin/charts/WalletFunnel.tsx
'use client';

import {
  FunnelChart, Funnel, Cell, LabelList,
  ResponsiveContainer, Tooltip
} from 'recharts';

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

export function WalletFunnel({ data }: { data: FunnelData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <FunnelChart>
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
        />
        <Funnel dataKey="value" data={data} isAnimationActive>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <LabelList
            position="right"
            fill="#fff"
            stroke="none"
            dataKey="name"
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
```

### CSV Export Button
```typescript
// components/admin/ExportButton.tsx
'use client';

import { CSVLink } from 'react-csv';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: { label: string; key: string }[];
}

export function ExportButton({ data, filename, headers }: ExportButtonProps) {
  return (
    <CSVLink
      data={data}
      filename={`${filename}-${new Date().toISOString().split('T')[0]}.csv`}
      headers={headers}
      className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded-lg"
    >
      Export CSV
    </CSVLink>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| recharts-scale dependency | Built-in scale utilities | Recharts 3.0 | Smaller bundle |
| react-smooth for animations | Built-in animation | Recharts 3.0 | Fewer dependencies |
| D3 direct manipulation | Declarative Recharts components | Recharts 2.0+ | Cleaner React code |
| External state management | React Context + hooks | React 18+ | Simpler patterns |

**Deprecated/outdated:**
- Recharts 2.x: Still works but 3.x has better performance and TypeScript support
- moment.js: Use date-fns instead (tree-shakeable, smaller)
- react-vis (Uber): Unmaintained, use Recharts or nivo

## Open Questions

Things that couldn't be fully resolved:

1. **Geographic Distribution**
   - What we know: Telegram Mini Apps can request geolocation with user permission via LocationManager
   - What's unclear: Whether users have granted location permission, how much location data exists
   - Recommendation: Check if profiles table has any location fields; if not, skip geographic dashboard section or add as future enhancement

2. **Real-time Updates**
   - What we know: Recharts supports data updates, Supabase has realtime subscriptions
   - What's unclear: Whether real-time dashboard updates are needed vs manual refresh
   - Recommendation: Start with manual refresh (button) + auto-refresh every 60s; add Supabase realtime later if needed

3. **Historical Data Depth**
   - What we know: Transactions table has all points history; profiles have created_at
   - What's unclear: How far back the data goes, whether there are enough users for meaningful cohorts
   - Recommendation: Build flexible date range selectors; UI should gracefully handle sparse data

## Sources

### Primary (HIGH confidence)
- Codebase analysis: scoreboard_v4_migration.sql, campaign_attributions_migration.sql, referrals_migration.sql
- Codebase analysis: pointsEngine.ts, supabaseAdmin.ts, existing API patterns
- [Recharts GitHub Releases](https://github.com/recharts/recharts/releases) - Version 3.6.0 features
- [Recharts 3.0 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) - Breaking changes and new features

### Secondary (MEDIUM confidence)
- [Ably Blog: Next.js and Recharts Dashboard](https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts) - Integration patterns
- [date-fns documentation](https://date-fns.org/docs/format) - Date formatting
- [SQL Habit: D1-D30 Retention](https://www.sqlhabit.com/lessons/calculating-d1-d30-retention-curve-part-1) - Retention query patterns
- [MUI X Heatmap Charts](https://mui.com/x/react-charts/heatmap/) - Heatmap concepts

### Tertiary (LOW confidence)
- Various WebSearch results on React dashboard best practices - trends and patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts is clearly dominant, verified via GitHub and npm
- Architecture: HIGH - Based on existing codebase patterns and Next.js App Router docs
- Pitfalls: HIGH - Based on real codebase analysis and known Next.js/Recharts issues
- Analytics queries: MEDIUM - SQL patterns are standard but need validation with actual data

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable domain, mature libraries)
