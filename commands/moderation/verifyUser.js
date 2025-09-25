/**
 * File: commands/moderation/verifyUser.js
 * Purpose: Provides a moderation command to initiate a verification process for a user.
 *
 * Responsibilities:
 * - Allows staff to manually initiate the verification flow.
 * - Creates a verification ticket via the shared utility (createVerificationTicket.js).
 * - Ensures proper permission validation before proceeding.
 *
 * Notes for Recruiters:
 * This command is part of the verification system.
 * It allows administrators to start a verification process on behalf of a user.
 * Verification tickets are handled consistently with other support tickets.
 */

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const createVerificationTicket = require('../../utils/createVerificationTicket');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('verify-user')
    .setDescription('Initiate the verification process for a user by creating a verification ticket.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to verify.')
        .setRequired(true)
    ),

  /**
   * Executes the verify-user command.
   * @param {object} interaction - Discord command interaction.
   */
  async execute(interaction) {
    try {
      // Ensure the caller has sufficient permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({
          content: 'You do not have permission to verify users.',
          flags: 64,
        });
      }

      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return interaction.reply({
          content: 'The specified user could not be found in this guild.',
          flags: 64,
        });
      }

      // Delegate ticket creation to the shared verification utility
      await createVerificationTicket.create({
        interaction,
        targetUser: member.user,
      });

      console.log(`[TicketSystem] Verification initiated for ${member.user.tag} in guild ${interaction.guild.id}`);

      // Note: createVerificationTicket handles success replies internally
    } catch (error) {
      console.error('[TicketSystem] Error executing verify-user command:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while initiating the verification process.',
          flags: 64,
        });
      }
    }
  },
};
