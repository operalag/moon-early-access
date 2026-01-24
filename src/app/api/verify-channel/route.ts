import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { awardPoints } from '@/lib/pointsEngine';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = '@cricketandcrypto'; // Ensure this matches your channel

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
    }

    // 1. Check Membership via Telegram API
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${user_id}`);
    const tgData = await tgRes.json();

    if (!tgData.ok) {
        console.error("Telegram API Error:", tgData);
        return NextResponse.json({ error: 'Failed to verify with Telegram' }, { status: 500 });
    }

    const status = tgData.result.status;
    const isMember = ['creator', 'administrator', 'member', 'restricted'].includes(status);

    if (isMember) {
        // 2. Check if already rewarded
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('has_joined_channel')
            .eq('telegram_id', user_id)
            .single();

        if (profile?.has_joined_channel) {
            return NextResponse.json({ joined: true, message: 'Already rewarded' });
        }

        // 3. Mark as Joined
        await supabaseAdmin
            .from('profiles')
            .update({ has_joined_channel: true })
            .eq('telegram_id', user_id);

        // 4. Award Points (Engine)
        try {
            await awardPoints(user_id, 500, 'channel_join');
        } catch (e) {
            console.error("Points Engine Error (Channel):", e);
        }

        return NextResponse.json({ joined: true });
    } else {
        return NextResponse.json({ joined: false, status: status });
    }

  } catch (error: any) {
    console.error('Verify Channel Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
