/**
 * Slash Command: /unset
 * ----------------------------------------
 * Clears a previously configured guild setting (channels or categories).
 *
 * Supported fields (must align with /set):
 * - moderation-log: Text channel for moderation logs
 * - ticket-transcripts: Text channel for ticket transcripts
 * - created-ticket-category: Category for created tickets
 * - join-leave-log: Text channel for join/leave notifications
 * - welcome-channel: Text channel for welcome messages
 * - level-up-log: Text channel for level-up notifications
 * - utc-time: Voice channel for UTC time display
 * - utc-date: Voice channel for UTC date display
 *
 * Notes:
 * - Settings are stored in the GuildConfig schema.
 * - Replies are ephemeral (flags: 64).
 */

const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('unconfigure')
    .setDescription('Clear a configured guild channel or category.')
    .addStringOption(option =>
      option
        .setName('field')
        .setDescription('Select the field to unset')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation Log (Text Channel)', value: 'moderation-log' },
          { name: 'Ticket Transcripts (Text Channel)', value: 'ticket-transcripts' },
          { name: 'Created Ticket Category (Category)', value: 'created-ticket-category' },
          { name: 'Join Leave Log (Text Channel)', value: 'join-leave-log' },
          { name: 'Welcome Channel (Text Channel)', value: 'welcome-channel' },
          { name: 'Level Up Log (Text Channel)', value: 'level-up-log' },
          { name: 'UTC Time (Voice Channel)', value: 'utc-time' },
          { name: 'UTC Date (Voice Channel)', value: 'utc-date' },
        ),
    ),

  async execute(interaction) {
    const field = interaction.options.getString('field');

    try {
      // ✅ Fetch the guild's configuration
      let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) {
        return interaction.reply({
          content: '⚠️ No configuration found for this server.',
          flags: 64,
        });
      }

      // ✅ Unset the selected field
      switch (field) {
        case 'moderation-log':
          guildConfig.moderationLogChannel = null;
          break;
        case 'ticket-transcripts':
          guildConfig.ticketTranscriptsChannel = null;
          break;
        case 'created-ticket-category':
          guildConfig.createdTicketCategory = null;
          break;
        case 'join-leave-log':
          guildConfig.joinLeaveLogChannel = null;
          break;
        case 'welcome-channel':
          guildConfig.welcomeChannel = null;
          break;
        case 'level-up-log':
          guildConfig.levelUpLogChannel = null;
          break;
        case 'utc-time':
          guildConfig.utcTimeChannel = null;
          break;
        case 'utc-date':
          guildConfig.utcDateChannel = null;
          break;
        default:
          return interaction.reply({
            content: '⚠️ Invalid field selected.',
            flags: 64,
          });
      }

      // ✅ Save the updated configuration
      await guildConfig.save();

      // ✅ Confirm success
      return interaction.reply({
        content: `✅ Successfully unset the **${field.replace(/-/g, ' ')}** field.`,
        flags: 64,
      });
    } catch (error) {
      console.error('❌ Error in /unset command:', error);
      return interaction.reply({
        content: '❌ An unexpected error occurred while unsetting the configuration.',
        flags: 64,
      });
    }
  },
};
