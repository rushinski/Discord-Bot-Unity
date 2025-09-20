/**
 * Command: /level-progress
 * Purpose: Display a user's current level and their progress toward the next milestone.
 *
 * Responsibilities:
 * - Retrieve the requesting user's record from the database.
 * - Dynamically recalculate the user’s level to ensure accuracy.
 * - Provide feedback about the user’s current level, message count,
 *   and progress toward the next level.
 * - If the user is at the maximum level, confirm their completion status.
 * - Always respond privately to the user.
 *
 * Notes for Recruiters:
 * This command demonstrates how the leveling system provides
 * individualized feedback. It shows both database persistence
 * and user-facing reporting in a professional, structured way.
 */

const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');
const { recalculateLevel } = require('../../utils/levelUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-progress')
    .setDescription('View your current level and progress toward the next milestone.'),

  /**
   * Execution handler for /level-progress.
   * @param {import('discord.js').CommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // Retrieve user record from the database
      let user = await User.findOne({ userId });

      // Handle case where user has no activity yet
      if (!user) {
        return interaction.reply({
          content: 'You have not started yet. Send messages to begin progressing.',
          flags: 64,
        });
      }

      // Ensure user level is up to date before reporting
      recalculateLevel(user, levels);
      await user.save();

      const currentLevelIndex = levels.findIndex(l => l.level === user.level);
      const currentLevel = levels[currentLevelIndex];
      const nextLevel = levels[currentLevelIndex + 1];

      let responseMessage;

      if (!nextLevel) {
        // User has reached the maximum level
        const progressToMax = user.messages / levels[levels.length - 1].messages;
        const percentageToMax = Math.min(100, Math.floor(progressToMax * 100));

        responseMessage =
          `You are at the highest level: **${currentLevel.level}**.\n` +
          `Progress toward maximum recorded messages: **${percentageToMax}%**.`;
      } else {
        // User is progressing toward the next level
        const rawProgress = user.messages / nextLevel.messages;
        const percentageToNext = Math.min(100, Math.max(0, Math.floor(rawProgress * 100)));
        const messagesRemaining = nextLevel.messages - user.messages;

        responseMessage =
          `You are at **${currentLevel.level}** with **${user.messages} messages**.\n` +
          `Progress toward next level: **${percentageToNext}%**.\n` +
          `Messages required to reach **${nextLevel.level}**: **${messagesRemaining}**.`;
      }

      return interaction.reply({
        content: responseMessage,
        flags: 64,
      });
    } catch (error) {
      console.error('[level-progress] Command execution failed:', error);

      return interaction.reply({
        content: 'An error occurred while checking your progress. Please try again later.',
        flags: 64,
      });
    }
  },
};
