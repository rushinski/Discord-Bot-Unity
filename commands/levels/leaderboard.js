/**
 * Command: /leaderboard
 * Purpose: Display the top 10 users ranked by message count and current level.
 *
 * Responsibilities:
 * - Query the database for the most active users, sorted by total messages.
 * - Construct a ranked leaderboard including each user’s level and message total.
 * - Present results in a structured embed for readability.
 * - Handle cases where no user activity exists yet.
 *
 * Notes for Recruiters:
 * This command highlights how user engagement data can be surfaced
 * into a visible ranking system. It complements /level-progress by
 * showing a community-wide view of participation.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Display the top 10 users by activity and level.'),

  /**
   * Execution handler for /leaderboard.
   * @param {import('discord.js').CommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    try {
      // Fetch top 10 users, ordered by message count
      const topUsers = await User.find().sort({ messages: -1 }).limit(10);

      if (topUsers.length === 0) {
        return interaction.reply({
          content: 'No activity has been recorded yet. Start participating to appear on the leaderboard.',
          flags: 64,
        });
      }

      // Build the leaderboard as a formatted string
      const leaderboard = topUsers
        .map((user, index) => {
          const rank = `#${index + 1}`;
          const mention = `<@${user.userId}>`;
          const level = levels.find(lvl => lvl.level === user.level)?.level || 'Unknown';
          return `${rank} ${mention} — Level: **${level}** | ${user.messages} messages`;
        })
        .join('\n');

      // Create a structured embed for display
      const leaderboardEmbed = new EmbedBuilder()
        .setTitle('Server Leaderboard')
        .setDescription(leaderboard)
        .setColor(0xffd700) // gold
        .setFooter({ text: 'Use /level-progress to view your personal statistics.' });

      return interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (err) {
      console.error('[leaderboard] Command execution failed:', err);

      return interaction.reply({
        content: 'An error occurred while retrieving the leaderboard. Please try again later.',
        flags: 64,
      });
    }
  },
};
