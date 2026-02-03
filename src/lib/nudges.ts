const NUDGES = [
  "🏆 <b>Weekly Rewards Alert!</b>\nTop 10 users earn 30,000 HNCH jettons on TON. Check your rank!",
  "💰 <b>Win Jettons Every Week</b>\nClimb the leaderboard to earn HNCH tokens. Use them to create new markets!",
  "🚀 <b>Invite Friends, Climb Faster</b>\nBring friends to MOON and boost your weekly ranking together.",
  "🎁 <b>30K HNCH Up for Grabs</b>\nWeekly rewards drop Sunday 12PM IST. Are you in the top 10?",
  "👥 <b>Syndicate Power</b>\nYour referrals boost your points. Invite a friend to reach the top!",
  "🔥 <b>Weekly Leaderboard Reset</b>\nNew week, new chance to win jettons. Start earning now!",
  "💎 <b>HNCH Token Rewards</b>\nTop performers get real tokens on TON. Keep your wallet connected!",
  "🏅 <b>Top 10 Gets Paid</b>\nWeekly jetton rewards await. Check your position on the leaderboard.",
  "⚡ <b>Create Markets with HNCH</b>\nWin jettons this week and use them to launch your own prediction markets.",
  "🌙 <b>MOON Rewards Sunday</b>\nJettons distributed to top 10 every week. Don't miss out!"
];

export function getRandomNudge(): string {
  const randomIndex = Math.floor(Math.random() * NUDGES.length);
  return NUDGES[randomIndex];
}
