/**
 * Admin Configuration
 *
 * Defines admin access rules for the analytics dashboard.
 *
 * Authentication methods:
 * 1. Telegram username: @tony_ca has automatic access
 * 2. Password: Browser users can authenticate via /admin/login
 */

// Telegram username allowed to access admin (without @)
export const ADMIN_USERNAME = 'tony_ca';

/**
 * Check if a Telegram username is an admin
 * @param username - The user's Telegram username (without @)
 * @returns true if the user is an admin
 */
export function isAdminUsername(username: string | undefined): boolean {
  if (!username) {
    return false;
  }
  return username.toLowerCase() === ADMIN_USERNAME.toLowerCase();
}

// Legacy: ID-based check (kept for backwards compatibility)
export const ADMIN_TELEGRAM_IDS: number[] = [
  458184707, // tony_ca
];

export function isAdmin(telegramId: number | undefined): boolean {
  if (!telegramId) {
    return false;
  }
  return ADMIN_TELEGRAM_IDS.includes(telegramId);
}
