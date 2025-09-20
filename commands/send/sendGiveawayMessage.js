/**
 * File: commands/send/sendGiveawayMessage.js
 * Purpose: Implements the /send-giveaway-message command to start a timed giveaway in a channel.
 *
 * Responsibilities:
 * - Accept command input for title, duration, prize, and number of winners.
 * - Validate input and post a giveaway embed with participation instructions.
 * - Persist giveaway data in MongoDB for tracking.
 * - Automatically end the giveaway after the specified duration and announce winners.
 *
 * Notes for Recruiters:
 * This command demonstrates how timed events are managed within the bot.
 * It validates user input, stores state in the database, and ensures
 * participants are selected fairly at the end of the giveaway.
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
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1s, 1m, 2h, 3d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
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
          content: 'Invalid duration format. Use s (seconds), m (minutes), h (hours), or d (days).',
          flags: 64, // ephemeral
        });
      }

      const giveawayChannel = interaction.channel;
      const endTime = Date.now() + ms(duration);
      const endTimeUTC = new Date(endTime).toUTCString();

      // Giveaway embed
      const giveawayEmbed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(
          `Prize: **${prize}**\n` +
          `Number of winners: **${winnersCount}**\n` +
          `Ends at: **${endTimeUTC}** (UTC)`
        )
        .setColor('Green')
        .setFooter({ text: 'Good luck to all participants!' })
        .setTimestamp();

      // Post giveaway
      const giveawayMessage = await giveawayChannel.send({ embeds: [giveawayEmbed] });
      await giveawayMessage.react('🎉');

      // Persist giveaway
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
        content: 'The giveaway has been started.',
        flags: 64, // ephemeral
      });

      // Schedule ending
      setTimeout(async () => {
        try {
          const updatedData = await Giveaway.findOne({ messageId: giveawayMessage.id });
          if (!updatedData) return; // Giveaway deleted or not found

          const users = await giveawayMessage.reactions.cache.get('🎉').users.fetch();
          users.delete(giveawayMessage.author.id); // Exclude bot

          const winners = users.random(winnersCount);
          const winnersMention = winners?.map(user => `<@${user.id}>`).join(', ') || 'No winners';

          const endEmbed = new EmbedBuilder()
            .setTitle(`${title} Ended`)
            .setDescription(`The giveaway for **${prize}** has ended.\nWinners: ${winnersMention}`)
            .setColor('Red')
            .setFooter({ text: 'Thanks for participating!' })
            .setTimestamp();

          await giveawayChannel.send({ embeds: [endEmbed] });

          // Remove entry from DB
          await Giveaway.deleteOne({ messageId: giveawayMessage.id });
        } catch (error) {
          console.error('[GiveawayEnd] Error ending giveaway:', error);
        }
      }, ms(duration));

    } catch (error) {
      console.error('[SendGiveawayMessage] Execution error:', error);
      return interaction.reply({
        content: 'An error occurred while starting the giveaway. Please try again.',
        flags: 64, // ephemeral
      });
    }
  },
};
