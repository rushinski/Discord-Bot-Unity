/**
 * Module: Level Utilities
 * Purpose: Provide helper functions for recalculating and validating user levels
 * based on configured thresholds in data/levels.js.
 *
 * Exports:
 * - recalculateLevel(user, levels): Assigns the correct level to a user
 *   based on total messages, handling both upgrades and downgrades.
 * - checkLevelChange(user, levels, previousLevel): Determines if a user's
 *   level has changed since the last calculation and returns a structured result.
 *
 * Notes for Recruiters:
 * These utilities encapsulate the business logic of progression. They
 * centralize level calculations so that event handlers and commands
 * remain clean and maintainable.
 */

/**
 * Recalculate the user's level based on total messages.
 * Always assigns the correct level (including downgrades).
 *
 * @param {Object} user - The user object (must contain messages and level).
 * @param {Array} levels - Array of level definitions from data/levels.js.
 * @returns {string} The newly assigned level name.
 */
const recalculateLevel = (user, levels) => {
  let newLevel = levels[0].level;

  for (const level of levels) {
    if (user.messages >= level.messages) {
      newLevel = level.level;
    } else {
      break;
    }
  }

  user.level = newLevel;
  return newLevel;
};

/**
 * Determine whether a user's level has changed compared to the previous state.
 *
 * @param {Object} user - The user object (must contain messages and level).
 * @param {Array} levels - Array of level definitions.
 * @param {string} previousLevel - The user's level before recalculation.
 * @returns {Object} Result object:
 *   {
 *     hasChanged: boolean,
 *     newLevel: string,
 *     message: string | null
 *   }
 */
const checkLevelChange = (user, levels, previousLevel) => {
  const newLevel = recalculateLevel(user, levels);

  if (newLevel !== previousLevel) {
    const levelDetails = levels.find(level => level.level === newLevel);
    return {
      hasChanged: true,
      newLevel,
      message: `User level updated to **${newLevel}**. ${levelDetails.message}`,
    };
  }

  return { hasChanged: false, newLevel, message: null };
};

module.exports = {
  recalculateLevel,
  checkLevelChange,
};
