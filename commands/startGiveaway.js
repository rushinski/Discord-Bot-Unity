const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms'); // Ensure you have the 'ms' package installed
const Giveaway = require('../schemas/giveaway'); // Import your MongoDB giveaway schema

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('start-giveaway')
    .setDescription('Start a giveaway!')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the giveaway')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (e.g., 1s, 1m, 2h, 3d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const duration = interaction.options.getString('duration');
    const prize = interaction.options.getString('prize');
    const winnersCount = interaction.options.getInteger('winners');

    // Validate duration
    if (!duration.match(/^\d+[smhd]$/)) {
      return interaction.reply({
        content: 'Invalid duration format! Use s (seconds), m (minutes), h (hours), or d (days).',
        ephemeral: true
      });
    }

    const giveawayChannel = interaction.channel;
    const endTime = Date.now() + ms(duration);
    const endTimeUTC = new Date(endTime).toUTCString();

    const giveawayEmbed = new EmbedBuilder()
      .setTitle(`${title} 🎉`)
      .setDescription(`Prize: **${prize}**\nNumber of winners: **${winnersCount}**\nEnds at: **${endTimeUTC}** (UTC)`)
      .setColor('Green')
      .setFooter({
        text: 'Good luck to all participants!'
      })
      .setTimestamp();

    const giveawayMessage = await giveawayChannel.send({ embeds: [giveawayEmbed] });
    await giveawayMessage.react('🎉');

    // Save the giveaway data to MongoDB
    const giveawayData = new Giveaway({
      title,
      prize,
      winnersCount,
      endDate: endTime,
      channelId: giveawayChannel.id,
      messageId: giveawayMessage.id
    });
    await giveawayData.save();

    await interaction.reply({
      content: 'The giveaway has been started!',
      ephemeral: true
    });

    // End giveaway after the duration
    setTimeout(async () => {
      const updatedData = await Giveaway.findOne({ messageId: giveawayMessage.id });
      if (!updatedData) return; // Giveaway was deleted or not found

      const users = await giveawayMessage.reactions.cache.get('🎉').users.fetch();
      users.delete(giveawayMessage.author.id); // Exclude bot from winners
      const winners = users.random(winnersCount);
      const winnersMention = winners.map(winner => `<@${winner.id}>`).join(', ') || 'No winners';

      const endEmbed = new EmbedBuilder()
        .setTitle(`${title} Ended!`)
        .setDescription(`The giveaway for **${prize}** has ended!\nWinners: ${winnersMention}`)
        .setColor('Red')
        .setFooter({
          text: 'Thanks for participating!'
        })
        .setTimestamp();

      giveawayChannel.send({ embeds: [endEmbed] });

      // Remove the giveaway data from MongoDB
      await Giveaway.deleteOne({ messageId: giveawayMessage.id });
    }, ms(duration));
  }
};
