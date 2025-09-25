/**
 * File: bannedWords.js
 * Purpose:
 * Define a list of banned words and phrases with severity levels.
 * This dataset is used by the moderation system (see events/checkBannedWords.js)
 * to determine appropriate disciplinary actions when violations occur.
 *
 * Responsibilities:
 * - Provide clear mappings between banned terms and their severity category.
 * - Support consistent moderation by encoding escalation logic in one place.
 *
 * Severity Levels:
 * - low: Issues a warning (two warnings escalate into one strike).
 * - medium: Directly issues one strike.
 * - high: Directly issues two strikes.
 * - critical: Immediate ban from the server.
 *
 * Recruiter Notes:
 * This list is intentionally simple to illustrate how configurable moderation
 * rules are maintained. In production, these entries would be aligned with
 * community standards and possibly stored in a database for easy updates.
 */

module.exports = [
  // Low severity (minor issues, warning only)
  { word: 'spam', severity: 'low' },
  { word: 'annoying', severity: 'low' },

  // Medium severity (strike-worthy offenses)
  { word: 'hate speech', severity: 'medium' },
  { word: 'explicit language', severity: 'medium' },
  { word: 'offensive remark', severity: 'medium' },

  // High severity (serious offenses, two strikes)
  { word: 'derogatory slur', severity: 'high' },
  { word: 'targeted harassment', severity: 'high' },

  // Critical severity (zero tolerance, immediate ban)
  { word: 'extreme slur', severity: 'critical' },
  { word: 'violent threat', severity: 'critical' },
];
