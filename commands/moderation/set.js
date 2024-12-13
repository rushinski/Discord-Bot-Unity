const { SlashCommandBuilder, ChannelType } = require('discord.js'); // Import ChannelType
const GuildConfig = require('../../schemas/config'); // Unified schema

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Configure various log channels and categories')
    .addStringOption(option =>
      option.setName('field')
        .setDescription('Select the field to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation Log (Text Channel)', value: 'moderation-log' },
          { name: 'Ticket Transcripts (Text Channel)', value: 'ticket-transcripts' },
          { name: 'Created Ticket Category (Category)', value: 'created-ticket-category' },
          { name: 'Leave Log (Text Channel)', value: 'leave-log' },
          { name: 'Welcome Channel (Text Channel)', value: 'welcome-channel' },
        )
    )
    .addStringOption(option =>
      option.setName('channel-id')
        .setDescription('Enter the ID of the channel or category')
        .setRequired(true)
    ),

  async execute(interaction) {
    const field = interaction.options.getString('field');
    const channelId = interaction.options.getString('channel-id');

    // Check if the provided ID matches the required type (Text Channel or Category)
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({
        content: `Invalid channel/category ID provided. Please ensure the ID is correct.`,
        ephemeral: true,
      });
    }

    // Validate the channel type for each field
    switch (field) {
      case 'moderation-log':
      case 'ticket-transcripts':
      case 'leave-log':
      case 'welcome-channel':
        if (channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `The selected field (${field}) requires a **Text Channel**. Please provide a valid Text Channel ID.`,
            ephemeral: true,
          });
        }
        break;
      case 'created-ticket-category':
        if (channel.type !== ChannelType.GuildCategory) {
          return interaction.reply({
            content: `The selected field (${field}) requires a **Category**. Please provide a valid Category ID.`,
            ephemeral: true,
          });
        }
        break;
      default:
        return interaction.reply({
          content: 'Invalid field selected.',
          ephemeral: true,
        });
    }

    // Fetch or initialize the guild's configuration
    let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) {
      guildConfig = new GuildConfig({ guildId: interaction.guild.id });
    }

    // Update the appropriate field in the guild configuration
    switch (field) {
      case 'moderation-log':
        guildConfig.moderationLogChannel = channelId;
        break;
      case 'ticket-transcripts':
        guildConfig.ticketTranscriptsChannel = channelId;
        break;
      case 'created-ticket-category':
        guildConfig.createdTicketCategory = channelId;
        break;
      case 'leave-log':
        guildConfig.leaveLogChannel = channelId;
        break;
      case 'welcome-channel':
        guildConfig.welcomeChannel = channelId;
        break;
    }

    // Save the updated configuration
    await guildConfig.save();

    // Reply with a confirmation message
    await interaction.reply({
      content: `Successfully updated **${field.replace(/-/g, ' ')}** with ID \`${channelId}\`.`,
      ephemeral: true,
    });
  },
};
