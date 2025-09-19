/**
 * File: utils/createVerificationTicket.js
 * Purpose: Wrapper utility for creating verification tickets.
 * Notes:
 * - Supports both user-initiated (button) and staff-initiated (command) verification flows.
 * - Delegates actual ticket creation to the shared createTicket utility.
 */

const GuildConfig = require('../schemas/config');
const Ticket = require('../schemas/ticket');
const createTicket = require('./createTicket');

module.exports = {
  /**
   * Creates a verification ticket for the given user.
   * 
   * @param {object} context - The context object containing necessary info.
   * @param {object} context.interaction - The original interaction (button/command).
   * @param {object} context.targetUser - The user to create the verification ticket for.
   */
  async create({ interaction, targetUser }) {
    try {
      const guild = interaction.guild;

      // Load guild configuration
      const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
      if (!guildConfig || !guildConfig.createdTicketCategory || !guildConfig.verificationRoleId) {
        return interaction.reply({
          content: 'Verification system is not fully configured. Please use `/configure` to set it up.',
          flags: 64,
        });
      }

      // Prevent duplicate verification tickets
      const existingTicket = await Ticket.findOne({
        userId: targetUser.id,
        guildId: guild.id,
        ticketType: 'verification',
        status: 'open',
      });

      if (existingTicket) {
        return interaction.reply({
          content: `${targetUser.tag} already has an open verification ticket.`,
          flags: 64,
        });
      }

      // Create ticket using shared utility
      await createTicket.create(
        {
          ...interaction,
          user: targetUser, // Override to use the target user, not the command executor
        },
        'verification',
        null,
        guildConfig,
        true
      );

      if (!interaction.replied) {
        await interaction.reply({
          content: `A verification ticket has been created for ${targetUser.tag}.`,
          flags: 64,
        });
      }

      console.log(`[TicketSystem] 🎟️ Verification ticket created for ${targetUser.tag} in guild ${guild.id}`);
    } catch (error) {
      console.error('[TicketSystem] Error creating verification ticket:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while creating the verification ticket.',
          flags: 64,
        });
      }
    }
  },
};
