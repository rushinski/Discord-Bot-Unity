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
 * - total-members: Voice channel for member count display
 * - level-up-log: Text channel for level-up notifications
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
    .setName('unset')
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
          { name: 'Join Leave Log (Text Channel)', value: 'join-leave-log' }, // ✅ corrected
          { name: 'Welcome Channel (Text Channel)', value: 'welcome-channel' },
          { name: 'Total Member Count (Voice Channel)', value: 'total-members' },
          { name: 'Level Up Log (Text Channel)', value: 'level-up-log' }, // ✅ added
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
        case 'join-leave-log': // ✅ corrected
          guildConfig.joinLeaveLogChannel = null;
          break;
        case 'welcome-channel':
          guildConfig.welcomeChannel = null;
          break;
        case 'total-members':
          guildConfig.memberCountChannel = null;
          break;
        case 'level-up-log': // ✅ added
          guildConfig.levelUpLogChannel = null;
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
