const { SlashCommandBuilder } = require('discord.js'); // Import ChannelType
const GuildConfig = require('../../schemas/config'); // Unified schema

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('unset')
    .setDescription('Unset or clear configured channels and categories')
    .addStringOption(option =>
      option.setName('field')
        .setDescription('Select the field to unset')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation Log (Text Channel)', value: 'moderation-log' },
          { name: 'Ticket Transcripts (Text Channel)', value: 'ticket-transcripts' },
          { name: 'Created Ticket Category (Category)', value: 'created-ticket-category' },
          { name: 'Leave Log (Text Channel)', value: 'leave-log' },
          { name: 'Welcome Channel (Text Channel)', value: 'welcome-channel' },
          { name: 'Total Member Count (Voice Channel)', value: 'total-members'}
        )
    ),

  async execute(interaction) {
    const field = interaction.options.getString('field');

    // Fetch the guild's configuration
    let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) {
      return interaction.reply({
        content: 'No configuration found for this server.',
        ephemeral: true,
      });
    }

    // Unset the selected field in the guild configuration
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
      case 'leave-log':
        guildConfig.joinLeaveLogChannel = null;
        break;
      case 'welcome-channel':
        guildConfig.welcomeChannel = null;
        break;
      case 'total-members':
        guildConfig.memberCountChannel = null;
        break;
      default:
        return interaction.reply({
          content: 'Invalid field selected.',
          ephemeral: true,
        });
    }

    // Save the updated configuration
    await guildConfig.save();

    // Reply with a confirmation message
    await interaction.reply({
      content: `Successfully unset the **${field.replace(/-/g, ' ')}** field.`,
      ephemeral: true,
    });
  },
};
