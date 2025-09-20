/**
 * File: configure.js
 * Purpose: Slash command to configure guild-specific logging and channel settings.
 *
 * Responsibilities:
 * - Allow administrators to set channels for moderation logs, join/leave logs,
 *   welcome messages, level-up notifications, and UTC voice displays.
 * - Validate that the provided channel matches the expected type.
 * - Persist settings to the GuildConfig schema in the database.
 * - Provide recruiter-friendly, clear error and success messages.
 *
 * Notes for Recruiters:
 * This command is used by server administrators to define where important
 * system events are logged. Each option maps a server event to a specific channel.
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

  /**
   * Execute the configure command.
   * @param {object} interaction - The Discord interaction instance.
   */
  async execute(interaction) {
    const field = interaction.options.getString('field');
    const channelId = interaction.options.getString('channel-id');

    try {
      // Validate channel ID
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({
          content: 'Invalid channel/category ID provided. Please ensure the ID is correct.',
          flags: 64,
        });
      }

      // Validate channel type against selected field
      switch (field) {
        case 'moderation-log':
        case 'join-leave-log':
        case 'welcome-channel':
        case 'level-up-log':
          if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({
              content: `The field **${field}** requires a Text Channel. Please provide a valid Text Channel ID.`,
              flags: 64,
            });
          }
          break;
        case 'utc-time':
        case 'utc-date':
          if (channel.type !== ChannelType.GuildVoice) {
            return interaction.reply({
              content: `The field **${field}** requires a Voice Channel. Please provide a valid Voice Channel ID.`,
              flags: 64,
            });
          }
          break;
        default:
          return interaction.reply({
            content: 'Invalid field selected.',
            flags: 64,
          });
      }

      // Fetch or initialize guild configuration
      let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) {
        guildConfig = new GuildConfig({ guildId: interaction.guild.id });
      }

      // Update the correct field
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

      // Save updated configuration
      await guildConfig.save();

      // Confirm success
      return interaction.reply({
        content: `Configuration updated: **${field.replace(/-/g, ' ')}** is now set to channel ID \`${channelId}\`.`,
        flags: 64,
      });
    } catch (error) {
      console.error('[ConfigureCommand] Error while updating configuration:', error);
      return interaction.reply({
        content: 'An unexpected error occurred while updating the configuration. Please try again later.',
        flags: 64,
      });
    }
  },
};
