/**
 * Slash Command: /leaderboard
 * ----------------------------------------
 * Displays the top 10 users in the server
 * ranked by total message count, including
 * their current level.
 *
 * Useful for tracking engagement and activity.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top chatters in the server.'),

  async execute(interaction) {
    try {
      // Fetch the top 10 users sorted by message count (highest first)
      const topUsers = await User.find().sort({ messages: -1 }).limit(10);

      // Handle case where no user records exist
      if (topUsers.length === 0) {
        return interaction.reply(
          '⚠️ No activity has been recorded yet. Start a conversation to appear on the leaderboard!'
        );
      }

      // Build leaderboard display string
      const leaderboard = topUsers
        .map((user, index) => {
          const rank = `**#${index + 1}**`;
          const mention = `<@${user.userId}>`;
          const level =
            levels.find(lvl => lvl.level === user.level)?.level || 'Unknown';
          const stats = `${user.messages} messages`;
          return `${rank} ${mention} — Level: **${level}** | ${stats}`;
        })
        .join('\n');

      // Create an embed for professional display
      const leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 Server Leaderboard')
        .setDescription(leaderboard)
        .setColor(0xffd700) // Gold
        .setFooter({ text: 'Use /level-progress to view your personal stats.' });

      // Reply with the leaderboard
      return interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (err) {
      // Log error for debugging but keep user-facing message professional
      console.error('Error generating leaderboard:', err);
      await interaction.reply(
        '⚠️ An error occurred while retrieving the leaderboard. Please try again later.'
      );
    }
  },
};
