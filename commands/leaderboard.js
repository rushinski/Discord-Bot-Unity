const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../schemas/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top chatters in the server!'),
  async execute(interaction) {
    const topUsers = await User.find().sort({ messages: -1 }).limit(10);

    if (topUsers.length === 0) {
      return interaction.reply("No one's talking yet! Be the first to grace us with your words. 🗣️");
    }

    const leaderboard = topUsers.map((user, index) => {
      const rank = `#${index + 1}`;
      const mention = `<@${user.userId}>`;
      const stats = `${user.messages} messages (${user.level})`;
      return `${rank} - ${mention}: ${stats}`;
    }).join('\n');

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle('🏆 Server Leaderboard 🏆')
      .setDescription(leaderboard)
      .setColor(0xffd700) // Gold
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' })

    await interaction.reply({ embeds: [leaderboardEmbed] });
  },
};
