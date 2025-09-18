/**
 * Level Utilities
 * ----------------------------------------
 * Provides helper functions for managing user levels
 * based on total message counts.
 *
 * Exports:
 * - recalculateLevel: Recomputes the user's level based on
 *   the configured thresholds in data/levels.js.
 * - checkLevelChange: Determines if a user's level has
 *   changed since their last known state and returns
 *   a structured result.
 */

 /**
  * Recalculate the user's level based on total messages.
  * Always assigns the correct level (including downgrades).
  *
  * @param {Object} user - The user object (with messages + level).
  * @param {Array} levels - Array of level definitions from data/levels.js.
  * @returns {string} The newly assigned level name.
  */
const recalculateLevel = (user, levels) => {
  let newLevel = levels[0].level;

  for (const level of levels) {
    if (user.messages >= level.messages) {
      newLevel = level.level;
    } else {
      break; // stop once the user no longer qualifies
    }
  }

  user.level = newLevel;
  return newLevel;
};

/**
 * Check if a user's level has changed (up or down) and return the result.
 *
 * @param {Object} user - The user object (with messages + level).
 * @param {Array} levels - Array of level definitions.
 * @param {string} previousLevel - The user's level before recalculation.
 * @returns {Object} Result object with { hasChanged, newLevel, message }.
 */
const checkLevelChange = (user, levels, previousLevel) => {
  const newLevel = recalculateLevel(user, levels);

  if (newLevel !== previousLevel) {
    const levelDetails = levels.find(level => level.level === newLevel);
    return {
      hasChanged: true,
      newLevel,
      message: `User has been reassigned to **${newLevel}**. ${levelDetails.message}`,
    };
  }

  return { hasChanged: false, newLevel, message: null };
};

module.exports = {
  recalculateLevel,
  checkLevelChange,
};
