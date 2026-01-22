import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();
    
    // TEMPORARY HARDCODED FOR DEBUGGING
    const apiKey = "87b3f79c-b1f5-4592-b8f3-68e8819d0cfc";
    const chatbotId = "JpN3e0wl5hs5iXwt53H9I";

    if (!apiKey || !chatbotId) {
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    // UPDATED ENDPOINT: Verified from documentation
    const response = await fetch('https://www.chatbase.co/api/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { content: message, role: 'user' }
        ],
        chatbotId: chatbotId,
        stream: false,
        conversationId: conversationId || undefined,
        temperature: 0
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Chatbase API Error Status:', response.status);
        return NextResponse.json({ 
          error: `Chatbase Error (${response.status}): ${errorText || 'Empty Response'}` 
        }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text, conversationId: data.conversationId });

  } catch (error) {
    console.error('Internal API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
