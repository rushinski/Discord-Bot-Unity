/**
 * File: commands/moderation/verifyUser.js
 * Purpose: Moderation command to initiate the verification process for a user.
 * Notes:
 * - Creates a verification ticket for the specified user.
 * - Does not assign roles directly; staff handle verification inside the ticket.
 */

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Ticket = require('../../schemas/ticket');
const createVerificationTicket = require('../../utils/createVerificationTicket');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('verify-user')
    .setDescription('Initiates the verification process for a user by creating a verification ticket.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to verify.')
        .setRequired(true)),

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

      // Check if user already has an open verification ticket
      const existingTicket = await Ticket.findOne({
        userId: user.id,
        guildId: interaction.guild.id,
        ticketType: 'verification',
        status: 'open',
      });

      if (existingTicket) {
        return interaction.reply({
          content: `${user.tag} already has an open verification ticket.`,
          flags: 64,
        });
      }

      // Create verification ticket for user
      await createVerificationTicket.create({
        user: member.user,
        guild: interaction.guild,
        reply: (options) => interaction.reply(options), // emulate interaction API
      });

      await interaction.reply({
        content: `A verification ticket has been created for ${user.tag}.`,
        flags: 64,
      });

      console.log(`[TicketSystem] 🎟️ Verification ticket created for ${user.tag} in guild ${interaction.guild.id}`);
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
