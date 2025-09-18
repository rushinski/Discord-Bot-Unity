/**
 * Slash Command: /level-progress
 * ----------------------------------------
 * Shows the user's progress toward the next
 * level milestone based on total messages.
 *
 * Notes:
 * - If the user is new, they are prompted to start.
 * - If at max level, progress to maximum is shown.
 * - Response is always ephemeral (private).
 */

const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');
const { recalculateLevel } = require('../../utils/levelUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-progress')
    .setDescription('Check your level progress and see how close you are to the next milestone.'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // Look up the user record in the database
      let user = await User.findOne({ userId });

      if (!user) {
        return interaction.reply({
          content: "ℹ️ You haven’t started yet! Send some messages to begin your journey. 🗣️",
          ephemeral: true,
        });
      }

      // Recalculate the user's level dynamically
      recalculateLevel(user, levels);
      await user.save();

      // Identify current and next levels
      const currentLevelIndex = levels.findIndex(l => l.level === user.level);
      const currentLevel = levels[currentLevelIndex];
      const nextLevel = levels[currentLevelIndex + 1];

      let responseMessage;

      if (!nextLevel) {
        // User has reached the maximum level
        const progressToMax = user.messages / levels[levels.length - 1].messages;
        const percentageToMax = Math.min(100, Math.floor(progressToMax * 100));

        responseMessage = `🎉 You are at the **highest level: ${currentLevel.level}**!\n` +
                          `You've achieved **${percentageToMax}%** of the max messages. Outstanding commitment!`;
      } else {
        // Calculate progress toward the next level
        const rawProgress = user.messages / nextLevel.messages;
        const percentageToNext = Math.min(100, Math.max(0, Math.floor(rawProgress * 100)));
        const messagesRemaining = nextLevel.messages - user.messages;

        responseMessage = `📊 You are at **${currentLevel.level}** with **${user.messages} messages**.\n` +
                          `Progress toward next goal: **${percentageToNext}%**.\n` +
                          `You need **${messagesRemaining} more messages** to reach **${nextLevel.level}**.`;
      }

      return interaction.reply({
        content: responseMessage,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error in /level-progress command:', error);

      return interaction.reply({
        content: '❌ An error occurred while checking your progress. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
