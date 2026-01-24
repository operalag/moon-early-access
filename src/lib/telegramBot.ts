const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

if (!BOT_TOKEN) {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN is missing. Notification system will fail.");
}

export async function sendTelegramMessage(chatId: number | string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        // Optional: Add a button to open the app directly
        reply_markup: {
            inline_keyboard: [[
                { text: "🚀 Open Moon App", web_app: { url: "https://prediction-early-access.vercel.app" } }
            ]]
        }
      })
    });

    const data = await res.json();

    if (!data.ok) {
      console.error(`Telegram Send Error [${chatId}]:`, data);
      
      // Handle "Blocked by user" error (Error 403)
      if (data.error_code === 403) {
          return { success: false, blocked: true };
      }
      return { success: false, error: data.description };
    }

    return { success: true };

  } catch (error: any) {
    console.error("Telegram Network Error:", error);
    return { success: false, error: error.message };
  }
}
