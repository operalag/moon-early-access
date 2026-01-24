import { NextResponse } from 'next/server';
import { processMegaphoneBatch } from '@/lib/megaphone';

export async function GET(request: Request) {
  try {
    // 1. Basic Security
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // You should set CRON_SECRET in Vercel. 
    // If not set, we'll use a fallback for now (change this in prod!)
    const EXPECTED_SECRET = process.env.CRON_SECRET || 'moon_debug_123';

    if (secret !== EXPECTED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Run Batch
    const results = await processMegaphoneBatch(20);

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results 
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
