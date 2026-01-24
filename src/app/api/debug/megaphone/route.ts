import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegramBot';
import { getRandomNudge } from '@/lib/nudges';

export async function POST(request: Request) {
  try {
    const { userId, customText } = await request.json();

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const message = customText || getRandomNudge();
    const result = await sendTelegramMessage(userId, message);

    return NextResponse.json({ 
      sent: result.success, 
      details: result,
      message: message 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
