import { supabaseAdmin } from './supabaseAdmin';
import { sendTelegramMessage } from './telegramBot';
import { getRandomNudge } from './nudges';

export async function processMegaphoneBatch(limit = 20) {
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    blocked: 0,
    errors: [] as string[]
  };

  try {
    // 1. Find Stale Users
    // Logic: 
    // - Push Enabled
    // - Inactive for > 24 hours
    // - Not notified in the last 48 hours
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const notificationThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('telegram_id, first_name')
      .eq('is_push_enabled', true)
      .lt('last_active_at', staleThreshold)
      .or(`last_notified_at.lt.${notificationThreshold},last_notified_at.is.null`)
      .limit(limit);

    if (error) throw error;
    if (!users || users.length === 0) return { ...results, message: "No stale users found" };

    results.processed = users.length;

    // 2. Loop and Nudge
    for (const user of users) {
      const nudge = getRandomNudge();
      const sendResult = await sendTelegramMessage(user.telegram_id, nudge);

      if (sendResult.success) {
        results.sent++;
        // 3. Update notification timestamp
        await supabaseAdmin
          .from('profiles')
          .update({ last_notified_at: new Date().toISOString() })
          .eq('telegram_id', user.telegram_id);
      } else {
        if (sendResult.blocked) {
            results.blocked++;
            // Opt them out automatically if they blocked the bot
            await supabaseAdmin
                .from('profiles')
                .update({ is_push_enabled: false })
                .eq('telegram_id', user.telegram_id);
        } else {
            results.failed++;
            results.errors.push(`User ${user.telegram_id}: ${sendResult.error}`);
        }
      }
    }

    return results;

  } catch (err: any) {
    console.error("Megaphone Engine Error:", err);
    throw err;
  }
}
