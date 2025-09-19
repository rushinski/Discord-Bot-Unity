/**
 * Slash Command: /send-giveaway-message
 * ----------------------------------------
 * Starts a giveaway in the current channel.
 *
 * Options:
 * - title: Title of the giveaway (string)
 * - duration: Duration (e.g., 1s, 1m, 2h, 3d)
 * - prize: Prize description (string)
 * - winners: Number of winners (integer)
 *
 * Behavior:
 * - Posts an embed with giveaway details.
 * - Reacts with 🎉 for participants to enter.
 * - Saves giveaway data to MongoDB (schema: Giveaway).
 * - Ends automatically after specified duration and announces winners.
 *
 * Notes:
 * - Duration must match pattern: [number][s|m|h|d]
 * - Ephemeral responses use flags: 64
 * - Includes professional-grade error handling.
 */

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const Giveaway = require('../../schemas/giveaway');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-giveaway-message')
    .setDescription('Start a giveaway in the current channel.')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the giveaway')
        .setRequired(true),
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (e.g., 1s, 1m, 2h, 3d)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true),
    ),

  async execute(interaction) {
    try {
      const title = interaction.options.getString('title');
      const duration = interaction.options.getString('duration');
      const prize = interaction.options.getString('prize');
      const winnersCount = interaction.options.getInteger('winners');

      // Validate duration format
      if (!/^\d+[smhd]$/.test(duration)) {
        return interaction.reply({
          content: '⚠️ Invalid duration format. Use s (seconds), m (minutes), h (hours), or d (days).',
          flags: 64, // ephemeral
        });
      }

      const giveawayChannel = interaction.channel;
      const endTime = Date.now() + ms(duration);
      const endTimeUTC = new Date(endTime).toUTCString();

      // Giveaway embed
      const giveawayEmbed = new EmbedBuilder()
        .setTitle(`${title} 🎉`)
        .setDescription(
          `Prize: **${prize}**\n` +
          `Number of winners: **${winnersCount}**\n` +
          `Ends at: **${endTimeUTC}** (UTC)`,
        )
        .setColor('Green')
        .setFooter({ text: 'Good luck to all participants!' })
        .setTimestamp();

      // Send giveaway message
      const giveawayMessage = await giveawayChannel.send({ embeds: [giveawayEmbed] });
      await giveawayMessage.react('🎉');

      // Persist giveaway in MongoDB
      const giveawayData = new Giveaway({
        title,
        prize,
        winnersCount,
        endDate: endTime,
        channelId: giveawayChannel.id,
        messageId: giveawayMessage.id,
      });

      await giveawayData.save();

      await interaction.reply({
        content: '✅ The giveaway has been started!',
        flags: 64, // ephemeral
      });

      // Schedule giveaway end
      setTimeout(async () => {
        try {
          const updatedData = await Giveaway.findOne({ messageId: giveawayMessage.id });
          if (!updatedData) return; // Giveaway deleted or not found

          const users = await giveawayMessage.reactions.cache.get('🎉').users.fetch();
          users.delete(giveawayMessage.author.id); // Exclude bot
          const winners = users.random(winnersCount);
          const winnersMention = winners?.map(user => `<@${user.id}>`).join(', ') || 'No winners';

          const endEmbed = new EmbedBuilder()
            .setTitle(`${title} Ended!`)
            .setDescription(`The giveaway for **${prize}** has ended!\nWinners: ${winnersMention}`)
            .setColor('Red')
            .setFooter({ text: 'Thanks for participating!' })
            .setTimestamp();

          await giveawayChannel.send({ embeds: [endEmbed] });

          // Cleanup DB
          await Giveaway.deleteOne({ messageId: giveawayMessage.id });
        } catch (error) {
          console.error('Error ending giveaway:', error);
        }
      }, ms(duration));

    } catch (error) {
      console.error('Error executing /send-giveaway-message:', error);
      return interaction.reply({
        content: '❌ An error occurred while starting the giveaway. Please try again.',
        flags: 64, // ephemeral
      });
    }
  },
};
