/**
 * Utility functions for handling user levels in the Discord bot.
 */

// Recalculate the user's level based on the current number of messages
const recalculateLevel = (user, levels) => {
  // Default to the lowest level
  let newLevel = levels[0].level;

  // Iterate through levels to find the correct level based on messages
  for (const level of levels) {
    if (user.messages >= level.messages) {
      newLevel = level.level;
    } else {
      // Stop iterating as levels are sorted in ascending order
      break;
    }
  }

  // Update the user's level
  user.level = newLevel;

  // Return the newly calculated level
  return newLevel;
};

// Check if a user has leveled up and return the notification message
const checkLevelUp = (user, levels) => {
  const previousLevel = user.level;
  const newLevel = recalculateLevel(user, levels);

  // If the level has changed, generate a level-up notification
  if (newLevel !== previousLevel) {
    const levelDetails = levels.find(level => level.level === newLevel);
    return {
      hasLeveledUp: true,
      message: `🎉 **${user.username}** has leveled up to **${newLevel}**! ${levelDetails.message}`,
    };
  }

  return { hasLeveledUp: false, message: null };
};

// Export utility functions
module.exports = {
  recalculateLevel,
  checkLevelUp,
};
