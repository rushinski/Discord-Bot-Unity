/**
 * File: commands/moderation/verifyUser.js
 * Purpose: Moderation command to initiate the verification process for a user.
 * Notes:
 * - Creates a verification ticket for the specified user.
 * - Delegates ticket creation to createVerificationTicket.js for consistency.
 */

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const createVerificationTicket = require('../../utils/createVerificationTicket');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('verify-user')
    .setDescription('Initiates the verification process for a user by creating a verification ticket.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to verify.')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Permission check
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

      // Use shared verification ticket creation flow
      await createVerificationTicket.create({
        interaction,
        targetUser: member.user,
      });

      console.log(`[TicketSystem] 🎟️ Staff-initiated verification for ${member.user.tag} in guild ${interaction.guild.id}`);

      // createVerificationTicket handles replies & logging internally
    } catch (error) {
      console.error('[TicketSystem] ❌ Error executing verify-user command:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while initiating the verification process.',
          flags: 64,
        });
      }
    }
  },
};
