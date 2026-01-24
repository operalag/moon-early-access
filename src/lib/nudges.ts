const NUDGES = [
  "🏏 <b>The pitch is ready. Are you?</b>\nYour daily streak is waiting.",
  "🔥 <b>Streak Alert!</b>\nDon't let your combo multiplier burn out. Log in now!",
  "👀 <b>Market Update</b>\nSomeone just overtook your rank on the leaderboard. Reclaim your spot!",
  "🎰 <b>Spin & Win</b>\nThe volatility wheel is reset. Your free spin is ready.",
  "📉 <b>Buy the Dip?</b>\nPrediction markets are moving. Check the latest odds.",
  "⚡ <b>Power Up</b>\nCollect your daily strategy points before they expire.",
  "🤔 <b>Cricket Insight</b>\nNew intel just dropped. See what the analysts are saying.",
  "💎 <b>Airdrop Check</b>\nActive users get higher allocation. Keep your activity up!",
  "🏆 <b>Champion's Mindset</b>\nConsistency is key. Log in to maintain your elite status.",
  "🚀 <b>To the Moon!</b>\nYour portfolio misses you. Come say hi."
];

export function getRandomNudge(): string {
  const randomIndex = Math.floor(Math.random() * NUDGES.length);
  return NUDGES[randomIndex];
}
