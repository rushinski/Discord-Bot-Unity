/**
 * Slash Command: /set
 * ----------------------------------------
 * Allows administrators to configure guild-specific
 * logging and channel settings.
 *
 * Supported fields:
 * - moderation-log: Text channel for moderation logs
 * - ticket-transcripts: Text channel for ticket transcripts
 * - created-ticket-category: Category for created tickets
 * - join-leave-log: Text channel for join/leave notifications
 * - welcome-channel: Text channel for welcome messages
 * - total-members: Voice channel for member count
 * - level-up-log: Text channel for level-up notifications
 *
 * Notes:
 * - Ensures channel type validation before saving.
 * - Settings are stored in the GuildConfig schema.
 * - Responses are always ephemeral for professionalism.
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Configure guild log channels and categories.')
    .addStringOption(option =>
      option
        .setName('field')
        .setDescription('Select the field to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation Log (Text Channel)', value: 'moderation-log' },
          { name: 'Ticket Transcripts (Text Channel)', value: 'ticket-transcripts' },
          { name: 'Created Ticket Category (Category)', value: 'created-ticket-category' },
          { name: 'Join Leave Log (Text Channel)', value: 'join-leave-log' },
          { name: 'Welcome Channel (Text Channel)', value: 'welcome-channel' },
          { name: 'Total Member Count (Voice Channel)', value: 'total-members' },
          { name: 'Level Up Log (Text Channel)', value: 'level-up-log' } 
        )
    )
    .addStringOption(option =>
      option
        .setName('channel-id')
        .setDescription('Enter the ID of the channel or category')
        .setRequired(true)
    ),

  async execute(interaction) {
    const field = interaction.options.getString('field');
    const channelId = interaction.options.getString('channel-id');

    // Validate channel ID
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({
        content: `⚠️ Invalid channel/category ID provided. Please ensure the ID is correct.`,
        ephemeral: true,
      });
    }

    // Validate the channel type against the selected field
    switch (field) {
      case 'moderation-log':
      case 'ticket-transcripts':
      case 'join-leave-log':
      case 'welcome-channel':
      case 'level-up-log':
        if (channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `⚠️ The selected field (${field}) requires a **Text Channel**. Please provide a valid Text Channel ID.`,
            ephemeral: true,
          });
        }
        break;
      case 'created-ticket-category':
        if (channel.type !== ChannelType.GuildCategory) {
          return interaction.reply({
            content: `⚠️ The selected field (${field}) requires a **Category**. Please provide a valid Category ID.`,
            ephemeral: true,
          });
        }
        break;
      case 'total-members':
        if (channel.type !== ChannelType.GuildVoice) {
          return interaction.reply({
            content: `⚠️ The selected field (${field}) requires a **Voice Channel**. Please provide a valid Voice Channel ID.`,
            ephemeral: true,
          });
        }
        break;
      default:
        return interaction.reply({
          content: '⚠️ Invalid field selected.',
          ephemeral: true,
        });
    }

    // Fetch or initialize the guild's configuration
    let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) {
      guildConfig = new GuildConfig({ guildId: interaction.guild.id });
    }

    // Update the correct field
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
      case 'join-leave-log':
        guildConfig.joinLeaveLogChannel = channelId;
        break;
      case 'welcome-channel':
        guildConfig.welcomeChannel = channelId;
        break;
      case 'total-members':
        guildConfig.memberCountChannel = channelId;
        break;
      case 'level-up-log':
        guildConfig.levelUpLogChannel = channelId;
        break;
    }

    // Save updated configuration
    await guildConfig.save();

    // Confirm success
    return interaction.reply({
      content: `✅ Successfully updated **${field.replace(/-/g, ' ')}** with ID \`${channelId}\`.`,
      ephemeral: true,
    });
  },
};
