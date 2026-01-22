import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const channelUsername = 'cricketandcrypto';
    const response = await fetch(`https://t.me/s/${channelUsername}`);
    const html = await response.text();

    // Simple Regex to extract message text
    // Matches <div class="tgme_widget_message_text ...">CONTENT</div>
    const regex = /<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/g;
    
    const matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      // Clean up HTML tags (basic)
      const cleanText = match[1]
        .replace(/<br\s*\/?>/gi, '\n') // Replace <br> with newlines
        .replace(/<[^>]*>/g, '')       // Remove other tags
        .trim();
        
      if (cleanText) {
        matches.push({
          id: Math.random().toString(36).substr(2, 9),
          text: cleanText,
          date: new Date().toISOString() // We don't have real date easily, simpler for MVP
        });
      }
    }

    // Get last 5 messages (reverse order usually in HTML? No, usually top to bottom)
    // The scraping usually gets them in chronological order. We want latest (bottom) first.
    const latestNews = matches.slice(-10).reverse();

    return NextResponse.json({ news: latestNews });

  } catch (error) {
    console.error('News Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
