import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { awardPoints } from '@/lib/pointsEngine';

const PRIZES = [
  { label: '5', value: 5, weight: 30 },
  { label: '50', value: 50, weight: 25 },
  { label: '100', value: 100, weight: 20 },
  { label: '200', value: 200, weight: 10 },
  { label: '500', value: 500, weight: 5 },
  { label: '1K', value: 1000, weight: 10 },
];

function getWeightedPrize() {
  const totalWeight = PRIZES.reduce((acc, p) => acc + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (const prize of PRIZES) {
    if (random < prize.weight) return prize;
    random -= prize.weight;
  }
  return PRIZES[0];
}

// Helper: Get today's date in Mumbai Time (YYYY-MM-DD)
const getMumbaiDate = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });

    // 1. Fetch Profile (Check Limit)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('last_spin_at, telegram_id')
      .eq('telegram_id', userId)
      .single();

    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Validate Time (Mumbai Midnight)
    if (profile.last_spin_at) {
      const lastDate = getMumbaiDate(profile.last_spin_at);
      const todayDate = getMumbaiDate();
      if (lastDate === todayDate) {
        return NextResponse.json({ error: 'Already spun today' }, { status: 429 });
      }
    }

    // 3. Determine Result
    const prize = getWeightedPrize();

    // 4. Award Points (Engine)
    await awardPoints(userId, prize.value, 'daily_spin', { prize_label: prize.label });

    // 5. Update Timestamp
    await supabaseAdmin
      .from('profiles')
      .update({ last_spin_at: new Date().toISOString() })
      .eq('telegram_id', userId);

    return NextResponse.json({ 
      success: true, 
      prize: prize 
    });

  } catch (error: any) {
    console.error('Spin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
