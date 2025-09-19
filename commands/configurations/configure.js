/**
 * File: commands/configurations/configure.js
 * Purpose: Configure guild-specific logging and general channel settings.
 *
 * Supported fields:
 * - moderation-log: Text channel for moderation logs
 * - join-leave-log: Text channel for join/leave notifications
 * - welcome-channel: Text channel for welcome messages
 * - level-up-log: Text channel for level-up notifications
 * - utc-time: Voice channel for UTC time display
 * - utc-date: Voice channel for UTC date display
 *
 * Notes:
 * - Ticket system configuration has been moved to configure-ticket-system.js.
 * - Ensures channel type validation before saving.
 * - Settings are stored in the GuildConfig schema.
 * - Replies are ephemeral (flags: 64).
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('configure')
    .setDescription('Configure guild log channels and categories.')
    .addStringOption(option =>
      option
        .setName('field')
        .setDescription('Select the field to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation Log (Text Channel)', value: 'moderation-log' },
          { name: 'Join Leave Log (Text Channel)', value: 'join-leave-log' },
          { name: 'Welcome Channel (Text Channel)', value: 'welcome-channel' },
          { name: 'Level Up Log (Text Channel)', value: 'level-up-log' },
          { name: 'UTC Time (Voice Channel)', value: 'utc-time' },
          { name: 'UTC Date (Voice Channel)', value: 'utc-date' },
        ),
    )
    .addStringOption(option =>
      option
        .setName('channel-id')
        .setDescription('Enter the ID of the channel or category')
        .setRequired(true),
    ),

  async execute(interaction) {
    const field = interaction.options.getString('field');
    const channelId = interaction.options.getString('channel-id');

    try {
      // ✅ Validate channel ID
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({
          content: '⚠️ Invalid channel/category ID provided. Please ensure the ID is correct.',
          flags: 64,
        });
      }

      // ✅ Validate channel type against selected field
      switch (field) {
        case 'moderation-log':
        case 'join-leave-log':
        case 'welcome-channel':
        case 'level-up-log':
          if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({
              content: `⚠️ The field **${field}** requires a **Text Channel**. Please provide a valid Text Channel ID.`,
              flags: 64,
            });
          }
          break;
        case 'utc-time':
        case 'utc-date':
          if (channel.type !== ChannelType.GuildVoice) {
            return interaction.reply({
              content: `⚠️ The field **${field}** requires a **Voice Channel**. Please provide a valid Voice Channel ID.`,
              flags: 64,
            });
          }
          break;
        default:
          return interaction.reply({
            content: '⚠️ Invalid field selected.',
            flags: 64,
          });
      }

      // ✅ Fetch or initialize guild configuration
      let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) {
        guildConfig = new GuildConfig({ guildId: interaction.guild.id });
      }

      // ✅ Update the correct field
      switch (field) {
        case 'moderation-log':
          guildConfig.moderationLogChannel = channelId;
          break;
        case 'join-leave-log':
          guildConfig.joinLeaveLogChannel = channelId;
          break;
        case 'welcome-channel':
          guildConfig.welcomeChannel = channelId;
          break;
        case 'level-up-log':
          guildConfig.levelUpLogChannel = channelId;
          break;
        case 'utc-time':
          guildConfig.utcTimeChannel = channelId;
          break;
        case 'utc-date':
          guildConfig.utcDateChannel = channelId;
          break;
      }

      // ✅ Save updated configuration
      await guildConfig.save();

      // ✅ Confirm success
      return interaction.reply({
        content: `✅ Successfully updated **${field.replace(/-/g, ' ')}** with ID \`${channelId}\`.`,
        flags: 64,
      });
    } catch (error) {
      console.error('[Config] Error in configure command:', error);
      return interaction.reply({
        content: '❌ An unexpected error occurred while updating the configuration. Please try again later.',
        flags: 64,
      });
    }
  },
};
