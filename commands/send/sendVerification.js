/**
 * File: commands/send/sendVerification.js
 * Purpose: Sends the verification panel with a button to initiate the verification process.
 * Notes:
 * - The button delegates ticket creation to createVerificationTicket.js.
 * - Ensures guild configuration is validated before sending.
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Sends the verification panel to the current channel.'),

  async execute(interaction) {
    try {
      // Load guild configuration
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig || !guildConfig.createdTicketCategory || !guildConfig.verificationRoleId) {
        return interaction.reply({
          content: 'Verification system is not fully configured. Please set a ticket category and verification role using `/configure`.',
          flags: 64,
        });
      }

      // Embed for verification system
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

      // Button to start verification
      const verificationButton = new ButtonBuilder()
        .setCustomId('startVerification')
        .setLabel('Start Verification')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(verificationButton);

      // Send verification panel
      await interaction.reply({
        embeds: [verificationEmbed],
        components: [row],
        ephemeral: false,
      });

      console.log(`[TicketSystem] 🎟️ Verification panel sent in guild ${interaction.guild.id}`);
    } catch (error) {
      console.error('[TicketSystem] Error sending verification panel:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while sending the verification panel. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
