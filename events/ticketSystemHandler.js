/**
 * File: events/ticketSystemHandler.js
 * Purpose: Handles interactions related to ticket system dropdowns and modals.
 *
 * Responsibilities:
 * - Listen for ticket type selections via dropdown menu.
 * - Display a modal for users to provide a description of their issue.
 * - Process submitted modals to create new tickets.
 * - Allow users to ping support from within tickets (with cooldown enforcement).
 *
 * Notes for Recruiters:
 * This event covers the interaction flow for creating general support tickets.
 * Users select a type of ticket, fill in a description, and a private channel
 * is created for staff and the user. Staff can also be pinged if needed.
 */

const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config');
const createTicket = require('../utils/createTicket');

const cooldowns = new Map();

module.exports = {
  name: Events.InteractionCreate,

  /**
   * Executes when an interaction is created.
   * @param {object} interaction - Discord interaction object.
   */
  async execute(interaction) {
    try {
      // Dropdown selection for ticket type
      if (interaction.isStringSelectMenu() && interaction.customId === 'ticketType') {
        const ticketType = interaction.values[0];

        const modal = new ModalBuilder()
          .setCustomId(`ticketDescription-${ticketType}`)
          .setTitle('Ticket Description');

        const descriptionInput = new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Please describe your issue')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(descriptionInput));

        return interaction.showModal(modal);
      }

      // Modal submission to create ticket
      if (interaction.isModalSubmit() && interaction.customId.startsWith('ticketDescription-')) {
        const ticketType = interaction.customId.replace('ticketDescription-', '');
        const description = interaction.fields.getTextInputValue('description');

        console.log(
          `[TicketSystem] Ticket creation requested by ${interaction.user.tag} for type ${ticketType} in guild ${interaction.guild.id}`
        );

        return createTicket.create({
          interaction,
          ticketType,
          description,
        });
      }

      // Ping support button (cooldown enforced)
      if (interaction.isButton() && interaction.customId === 'ping-support') {
        const now = Date.now();
        const cooldownEnd = cooldowns.get(interaction.channel.id) || 0;

        if (now < cooldownEnd) {
          const remaining = Math.ceil((cooldownEnd - now) / 60000);
          return interaction.reply({
            content: `You must wait ${remaining} minute(s) before pinging support again.`,
            flags: 64,
          });
        }

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!guildConfig || !guildConfig.generalSupportRoleId) {
          return interaction.reply({
            content: 'Support role is not configured. Please configure it using `/configure-ticket-system`.',
            flags: 64,
          });
        }

        cooldowns.set(interaction.channel.id, now + 15 * 60 * 1000); // 15 minutes
        await interaction.reply({
          content: `<@&${guildConfig.generalSupportRoleId}> has been notified for assistance.`,
        });

        console.log(
          `[TicketSystem] Support role pinged in ticket ${interaction.channel.id} by ${interaction.user.tag}`
        );
      }
    } catch (error) {
      console.error('[TicketSystem] Error handling interaction in ticketSystemHandler:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while processing your ticket interaction.',
          flags: 64,
        });
      }
    }
  },
};
