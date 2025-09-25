/**
 * File: commands/send/sendVerification.js
 * Purpose: Sends the verification panel with a button to initiate the verification process.
 *
 * Responsibilities:
 * - Validate that the verification system is configured for the guild.
 * - Send an embed with a verification button to the current channel.
 * - Provide users with a clear entry point for the verification process.
 *
 * Notes for Recruiters:
 * This command posts a verification panel where users can click a button to start the process.
 * Clicking the button creates a private verification ticket for staff to review.
 * This is part of the ticket system's structured verification workflow.
 */

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Send the verification panel to the current channel.'),

  /**
   * Executes the send-verification command.
   * @param {object} interaction - Discord command interaction.
   */
  async execute(interaction) {
    try {
      // Load guild-specific configuration
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

      // Ensure the verification system is properly configured
      if (!guildConfig || !guildConfig.createdTicketCategory || !guildConfig.verificationRoleId) {
        return interaction.reply({
          content:
            'Verification system is not fully configured. Please set a ticket category and verification role using `/configure-ticket-system`.',
          flags: 64,
        });
      }

      // Construct the verification embed
      const verificationEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Server Verification')
        .setDescription(
          `Welcome to **${interaction.guild.name}**.\n\n` +
          `To access the server, please start the verification process by clicking the button below.\n` +
          `A private verification ticket will be created where staff can review your request.`
        )
        .setFooter({ text: `${interaction.guild.name} • Verification System` })
        .setTimestamp();

      // Create the verification button
      const verificationButton = new ButtonBuilder()
        .setCustomId('startVerification')
        .setLabel('Start Verification')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(verificationButton);

      // Send the verification panel
      await interaction.reply({
        embeds: [verificationEmbed],
        components: [row],
        ephemeral: false,
      });

      console.log(`[TicketSystem] Verification panel sent in guild ${interaction.guild.id}`);
    } catch (error) {
      console.error('[TicketSystem] Error sending verification panel:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content:
            'An error occurred while sending the verification panel. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
