# Phase 10: Admin Leaderboard View - Research

**Researched:** 2026-02-01
**Domain:** Admin Dashboard / Leaderboard Display / CSV Export
**Confidence:** HIGH

## Summary

This phase adds three leaderboard views (overall, weekly, daily) to the existing admin dashboard. The infrastructure from Phase 9 is well-established: admin authentication via `AdminGuard`, analytics API routes at `/api/admin/analytics/*`, reusable components like `ExportButton` using react-csv, and consistent dark theme styling with Tailwind.

The data model is already in place. The `leaderboard_buckets` table stores daily/weekly point totals keyed by `period_type` and `period_key`. The `profiles` table contains `first_name`, `username`, `total_points`, and `ton_wallet_address` columns needed for display. The existing `/api/leaderboard` route already demonstrates query patterns for both all-time (profiles) and period-based (leaderboard_buckets) data.

**Primary recommendation:** Create a single new API route `/api/admin/analytics/leaderboards` that returns top 10 for all three timeframes, and a new `LeaderboardTable` component that reuses the established table/export patterns from Phase 9.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-csv | ^2.2.2 | CSV export via CSVLink | Already used in ExportButton, proven pattern |
| date-fns | ^4.1.0 | Date formatting | Already used throughout admin dashboard |
| lucide-react | ^0.562.0 | Icons (Download, Trophy, etc.) | Already used for consistent iconography |
| @supabase/supabase-js | ^2.91.0 | Database queries | Already configured with admin client |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | ^3.7.0 | Charts | NOT needed for this phase (table only) |
| tailwind-merge | ^3.4.0 | Class merging | For conditional styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-csv | Custom CSV builder | react-csv is already in use, no reason to change |
| Table display | DataGrid component | Overkill for 10 rows; simple table matches existing CampaignTable pattern |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── admin/dashboard/page.tsx       # Add new leaderboard section
│   └── api/admin/analytics/
│       └── leaderboards/route.ts      # NEW: Returns all 3 leaderboards
└── components/admin/
    └── LeaderboardTable.tsx           # NEW: Reusable leaderboard display
```

### Pattern 1: Single API for Multiple Leaderboards
**What:** Return all three leaderboard timeframes in one API call
**When to use:** When the total data is small (3 x 10 rows = 30 rows max)
**Example:**
```typescript
// Source: Existing /api/leaderboard/route.ts pattern
interface LeaderboardEntry {
  rank: number;
  first_name: string;
  username: string | null;
  wallet_address: string | null;
  points: number;
}

interface LeaderboardsResponse {
  overall: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  daily: LeaderboardEntry[];
  generated_at: string;
}
```

### Pattern 2: Supabase Join for Profile Data
**What:** Use foreign key joins to get profile data from leaderboard_buckets
**When to use:** When querying period-based leaderboards (daily/weekly)
**Example:**
```typescript
// Source: Existing referrals/route.ts pattern
const { data: buckets } = await supabaseAdmin
  .from('leaderboard_buckets')
  .select(`
    user_id,
    points,
    profiles!leaderboard_buckets_user_id_fkey(
      first_name,
      username,
      ton_wallet_address
    )
  `)
  .eq('period_type', 'daily')
  .eq('period_key', todayKey)
  .order('points', { ascending: false })
  .limit(10);
```

### Pattern 3: Existing ExportButton Integration
**What:** Reuse ExportButton component with custom headers
**When to use:** For all CSV exports
**Example:**
```typescript
// Source: Existing dashboard page.tsx pattern
const leaderboardHeaders = [
  { label: 'Rank', key: 'rank' },
  { label: 'Name', key: 'first_name' },
  { label: 'Username', key: 'username' },
  { label: 'Wallet Address', key: 'wallet_address' },
  { label: 'Points', key: 'points' },
];

<ExportButton
  data={leaderboardData}
  filename="leaderboard-overall"
  headers={leaderboardHeaders}
/>
```

### Anti-Patterns to Avoid
- **Separate API calls per timeframe:** Increases latency and complexity. One call for all three is better.
- **Fetching all users then filtering:** Always use `.limit(10)` at the database level.
- **Storing rank in database:** Compute rank in API from ordered results (rank = index + 1).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV generation | Custom CSV string builder | react-csv CSVLink | Already in use, handles escaping, headers, encoding |
| Date formatting | Manual date string manipulation | date-fns format() | Consistent with existing dashboard, locale-aware |
| Wallet address truncation | substring(0,8) + "..." | Utility function | Need proper start/end display for verification |
| Empty state handling | Custom conditionals | Pattern from LeaderboardTrends | Consistent UX across components |

**Key insight:** Phase 9 established all the patterns. This phase is about applying them consistently, not inventing new ones.

## Common Pitfalls

### Pitfall 1: Stale Period Keys
**What goes wrong:** Daily/weekly leaderboards show yesterday's data or no data
**Why it happens:** Hardcoding period_key or not computing it fresh on each request
**How to avoid:** Compute period keys dynamically in the API route:
```typescript
const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const weeklyKey = // Use date-fns getISOWeek + format
```
**Warning signs:** Leaderboard appears empty or unchanged between days

### Pitfall 2: Null Wallet Addresses in Export
**What goes wrong:** CSV contains "null" or "undefined" strings
**Why it happens:** Direct export of database null values
**How to avoid:** Map data before export:
```typescript
const exportData = leaderboard.map(entry => ({
  ...entry,
  wallet_address: entry.wallet_address || 'Not connected',
}));
```
**Warning signs:** CSV file contains literal "null" text

### Pitfall 3: Missing Profiles Join
**What goes wrong:** Only points/user_id visible, no names or usernames
**Why it happens:** Forgetting the profiles join in Supabase query
**How to avoid:** Always use explicit foreign key syntax:
```typescript
.select('points, profiles!leaderboard_buckets_user_id_fkey(first_name, username, ton_wallet_address)')
```
**Warning signs:** TypeScript errors about missing properties on response

### Pitfall 4: Weekly Period Key Format
**What goes wrong:** Weekly leaderboard returns wrong week's data
**Why it happens:** JavaScript ISO week calculation differs from Postgres
**How to avoid:** Match Postgres format exactly: `IYYY-"W"IW` (e.g., "2026-W05")
```typescript
import { getISOWeek, getISOWeekYear, format } from 'date-fns';
const weeklyKey = `${getISOWeekYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
```
**Warning signs:** Weekly data missing or showing different week than expected

## Code Examples

Verified patterns from existing codebase:

### Query All-Time Leaderboard (from profiles)
```typescript
// Source: /api/leaderboard/route.ts
const { data: profiles, error } = await supabaseAdmin
  .from('profiles')
  .select('telegram_id, username, first_name, total_points, ton_wallet_address')
  .order('total_points', { ascending: false })
  .limit(10);

const overall = profiles?.map((p, i) => ({
  rank: i + 1,
  first_name: p.first_name || 'Anonymous',
  username: p.username || null,
  wallet_address: p.ton_wallet_address || null,
  points: p.total_points || 0,
})) || [];
```

### Query Period Leaderboard (from buckets with join)
```typescript
// Source: /api/admin/analytics/referrals/route.ts pattern
const { data: buckets, error } = await supabaseAdmin
  .from('leaderboard_buckets')
  .select(`
    user_id,
    points,
    profiles!leaderboard_buckets_user_id_fkey(
      first_name,
      username,
      ton_wallet_address
    )
  `)
  .eq('period_type', 'daily')
  .eq('period_key', dailyKey)
  .order('points', { ascending: false })
  .limit(10);

const daily = buckets?.map((b, i) => ({
  rank: i + 1,
  first_name: b.profiles?.[0]?.first_name || 'Anonymous',
  username: b.profiles?.[0]?.username || null,
  wallet_address: b.profiles?.[0]?.ton_wallet_address || null,
  points: b.points,
})) || [];
```

### Table Component with Medals (Styling Pattern)
```typescript
// Source: /components/admin/ReferralStats.tsx pattern
const medalColors: { [key: number]: string } = {
  1: 'bg-yellow-500', // Gold
  2: 'bg-zinc-400',   // Silver
  3: 'bg-amber-600',  // Bronze
};

// In render:
<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
  rank <= 3 ? `${medalColors[rank]} text-black` : 'bg-zinc-700 text-zinc-300'
}`}>
  {rank}
</div>
```

### Wallet Address Truncation
```typescript
// Recommended utility
function truncateAddress(address: string | null): string {
  if (!address) return 'Not connected';
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate page for leaderboards | Integrated into dashboard | Phase 9 established patterns | Consistent admin experience |
| Manual CSV generation | react-csv CSVLink | Already in use | Reliable exports with proper encoding |

**Deprecated/outdated:**
- None. This phase follows established Phase 9 patterns exactly.

## Open Questions

Things that couldn't be fully resolved:

1. **Wallet address column existence**
   - What we know: `ton_wallet_address` is documented in FINAL_STATUS_REPORT.md as added
   - What's unclear: Whether column is actively being populated (code shows it commented out)
   - Recommendation: Query will work either way (returns null if not populated); display "Not connected" for null values

2. **Tab vs. Accordion for 3 leaderboards**
   - What we know: Dashboard uses expandable sections, not tabs
   - What's unclear: User preference for viewing multiple leaderboards
   - Recommendation: Use 3 side-by-side cards in a grid (lg:grid-cols-3), matching dashboard visual language

## Sources

### Primary (HIGH confidence)
- `/Users/tonicaradonna/prediction-early-access/src/app/admin/dashboard/page.tsx` - Existing dashboard patterns
- `/Users/tonicaradonna/prediction-early-access/src/app/api/leaderboard/route.ts` - Leaderboard query patterns
- `/Users/tonicaradonna/prediction-early-access/src/app/api/admin/analytics/referrals/route.ts` - Supabase join patterns
- `/Users/tonicaradonna/prediction-early-access/src/components/admin/ExportButton.tsx` - CSV export patterns
- `/Users/tonicaradonna/prediction-early-access/src/components/admin/ReferralStats.tsx` - Leaderboard display patterns
- `/Users/tonicaradonna/prediction-early-access/src/components/admin/CampaignTable.tsx` - Table styling patterns
- `/Users/tonicaradonna/prediction-early-access/scoreboard_v4_migration.sql` - Database schema

### Secondary (MEDIUM confidence)
- react-csv GitHub README - API reference for CSVLink component
- `/Users/tonicaradonna/prediction-early-access/FINAL_STATUS_REPORT.md` - Column documentation

### Tertiary (LOW confidence)
- None. All patterns verified in codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use
- Architecture: HIGH - Patterns directly copied from Phase 9 components
- Pitfalls: HIGH - Identified from existing code and common Supabase/date patterns

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable patterns, no library changes expected)
