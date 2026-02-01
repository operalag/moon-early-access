/**
 * Admin Configuration
 *
 * Defines the list of admin Telegram user IDs and provides
 * a utility function to check if a user is an admin.
 */

// Primary admin user IDs
export const ADMIN_TELEGRAM_IDS: number[] = [
  458184707, // Primary admin
];

/**
 * Check if a Telegram user ID belongs to an admin
 * @param telegramId - The user's Telegram ID
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(telegramId: number | undefined): boolean {
  if (!telegramId) {
    return false;
  }
  return ADMIN_TELEGRAM_IDS.includes(telegramId);
}
