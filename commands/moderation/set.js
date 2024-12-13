const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/config'); // Unified schema

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Configure various log channels and categories')
    .addSubcommand(subcommand =>
      subcommand
        .setName('moderation-log')
        .setDescription('Banned words, edits, and deletes go here')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to log moderation events')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ticket-transcripts-log')
        .setDescription('Set where ticket transcripts are logged')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to log ticket transcripts')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('created-ticket-category')
        .setDescription('Set the category for created tickets')
        .addChannelOption(option =>
          option
            .setName('category')
            .setDescription('The category for created tickets')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave-log')
        .setDescription('Set the channel to log when members leave')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to log member leave events')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('welcome-channel')
        .setDescription('Set the channel to send welcome messages')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to send welcome messages')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is provided
    if (!channel) {
      return interaction.reply({
        content: 'You must provide a valid channel.',
        ephemeral: true,
      });
    }

    // Fetch or initialize the guild's configuration
    let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) {
      guildConfig = new GuildConfig({ guildId: interaction.guild.id });
    }

    // Update the appropriate field based on the subcommand
    switch (subcommand) {
      case 'moderation-log':
        guildConfig.moderationLogChannel = channel.id;
        await interaction.reply({
          content: `Moderation logs will now be sent to ${channel}.`,
          ephemeral: true,
        });
        break;

      case 'ticket-transcripts-log':
        guildConfig.ticketTranscriptsChannel = channel.id;
        await interaction.reply({
          content: `Ticket transcripts will now be logged in ${channel}.`,
          ephemeral: true,
        });
        break;

      case 'created-ticket-category':
        guildConfig.createdTicketCategory = channel.id;
        await interaction.reply({
          content: `Created tickets will now be placed under the ${channel} category.`,
          ephemeral: true,
        });
        break;

      case 'leave-log':
        guildConfig.leaveLogChannel = channel.id;
        await interaction.reply({
          content: `Member leave logs will now be sent to ${channel}.`,
          ephemeral: true,
        });
        break;

      case 'welcome-channel':
        guildConfig.welcomeChannel = channel.id;
        await interaction.reply({
          content: `Welcome messages will now be sent to ${channel}.`,
          ephemeral: true,
        });
        break;

      default:
        await interaction.reply({
          content: 'Invalid subcommand.',
          ephemeral: true,
        });
    }

    // Save the updated configuration
    await guildConfig.save();
  },
};
