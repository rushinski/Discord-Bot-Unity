/**
 * Data: Banned Words List
 * ----------------------------------------
 * Defines banned words/phrases and their severity levels.
 * Used by the moderation system (events/checkBannedWords.js)
 * to determine appropriate actions against offenders.
 *
 * Severity Levels:
 * - low: issues a warning (2 warnings = 1 strike)
 * - medium: 1 strike
 * - high: 2 strikes
 * - critical: immediate ban
 *
 * Notes:
 * - Matching is case-insensitive by default.
 * - Fuzzy matching is used to detect obfuscated variants.
 * - Keep the list concise and aligned with community standards.
 * - For advanced filtering, regex patterns can be implemented.
 */

module.exports = [
  // Low severity (warnings → 2 warnings = 1 strike)
  { word: 'spam', severity: 'low' },
  { word: 'annoying', severity: 'low' },

  // Medium severity (1 strike)
  { word: 'hate speech', severity: 'medium' },
  { word: 'profanity1', severity: 'medium' },
  { word: 'profanity2', severity: 'medium' },

  // High severity (2 strikes)
  { word: 'slur1', severity: 'high' },
  { word: 'slur2', severity: 'high' },

  // Critical severity (immediate ban)
  { word: 'extreme slur', severity: 'critical' },
  { word: 'violent threat', severity: 'critical' },
];
