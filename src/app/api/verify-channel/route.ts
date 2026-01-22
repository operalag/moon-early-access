import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = '-1002802593537'; // Numeric ID for @cricketandcrypto

    if (!botToken) {
      console.error("Missing Bot Token");
      return NextResponse.json({ error: 'Configuration Error: Bot Token Missing' }, { status: 500 });
    }

    if (!user_id) {
        return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    // Call Telegram API
    const tgUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelId}&user_id=${user_id}`;
    
    const tgRes = await fetch(tgUrl);
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram API Error:', tgData);
      return NextResponse.json({ 
          error: `Telegram Error: ${tgData.description}`,
          raw: tgData 
      }, { status: 400 });
    }

    const status = tgData.result.status;
    const validStatuses = ['member', 'administrator', 'creator'];
    const isJoined = validStatuses.includes(status);

    return NextResponse.json({ joined: isJoined, status, debug_user: user_id });

  } catch (error: any) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}
