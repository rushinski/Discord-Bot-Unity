const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels'); // Import the levels data to show user levels

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top chatters in the server!'),
  async execute(interaction) {
    // Fetch the top 10 users sorted by message count in descending order
    const topUsers = await User.find().sort({ messages: -1 }).limit(10);

    // Handle case where there are no users yet
    if (topUsers.length === 0) {
      return interaction.reply("No one's talking yet! Be the first to grace us with your words. 🗣️");
    }

    // Build the leaderboard list with rank, level, and message count
    const leaderboard = topUsers.map((user, index) => {
      const rank = `**#${index + 1}**`;
      const mention = `<@${user.userId}>`;
      const level = levels.find(lvl => lvl.level === user.level)?.level || 'Unknown Level';
      const stats = `${user.messages} messages`;
      return `${rank} ${mention} - Level: **${level}** | ${stats}`;
    }).join('\n');

    // Create and send the embed
    const leaderboardEmbed = new EmbedBuilder()
      .setTitle('🏆 Server Leaderboard 🏆')
      .setDescription(leaderboard)
      .setColor(0xffd700) // Gold color for the embed
      .setFooter({ text: 'Use /yap-check to see your progress!' });

    await interaction.reply({ embeds: [leaderboardEmbed] });
  },
};
