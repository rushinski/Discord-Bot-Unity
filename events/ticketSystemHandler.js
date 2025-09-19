/**
 * File: events/ticketSystemHandler.js
 * Purpose: Handles ticket creation and support pings for the ticket system.
 * Notes:
 * - Uses GuildConfig for support roles and ticket category configuration.
 * - Delegates actual ticket channel creation to a shared utility.
 * - Enforces cooldowns on support pings to prevent spam.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const GuildConfig = require('../schemas/config');
const Ticket = require('../schemas/ticket');
const createTicket = require('../utils/createTicket');

const pingCooldown = new Map();

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    try {
      /**
       * Handle dropdown selection → launches modal
       */
      if (interaction.isStringSelectMenu() && interaction.customId === 'ticketType') {
        // Store selected type in interaction state
        interaction.client.userSelectedTicketType = interaction.values[0];

        // Delegate modal handling (kept in createTicket util)
        return await createTicket.showDescriptionModal(interaction);
      }

      /**
       * Handle modal submission → creates ticket
       */
      if (interaction.isModalSubmit() && interaction.customId === 'ticketDescriptionModal') {
        const ticketType = interaction.client.userSelectedTicketType;
        const description = interaction.fields.getTextInputValue('ticketDescription');

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!guildConfig || !guildConfig.createdTicketCategory) {
          return interaction.reply({
            content: 'The ticket system is not configured. Please set a ticket category using `/configure`.',
            flags: 64,
          });
        }

        // Ensure user does not already have an open ticket
        const existingTicket = await Ticket.findOne({
          userId: interaction.user.id,
          guildId: interaction.guild.id,
          status: { $ne: 'closed' },
        });
        if (existingTicket) {
          return interaction.reply({
            content: 'You already have an open ticket. Please close it before creating a new one.',
            flags: 64,
          });
        }

        // Create the ticket via shared utility
        return await createTicket.create(interaction, ticketType, description, guildConfig);
      }

      /**
       * Handle support ping button
       */
      if (interaction.isButton() && interaction.customId === 'pingSupport') {
        const ticketData = await Ticket.findOne({ channelId: interaction.channel.id });
        if (!ticketData) {
          return interaction.reply({
            content: 'No open ticket is associated with this channel.',
            flags: 64,
          });
        }

        const now = Date.now();
        const lastPing = pingCooldown.get(interaction.channel.id) || ticketData.createdAt;
        const timeDifference = now - lastPing;

        const cooldownMs = 15 * 60 * 1000; // 15 minutes
        if (timeDifference < cooldownMs) {
          const remainingMinutes = Math.ceil((cooldownMs - timeDifference) / 60000);
          return interaction.reply({
            content: `You must wait ${remainingMinutes} minutes before pinging support again.`,
            flags: 64,
          });
        }

        pingCooldown.set(interaction.channel.id, now);

        // Resolve support role dynamically
        const supportRoleId =
          ticketData.ticketType === 'application' || ticketData.ticketType === 'rss_sellers'
            ? guildConfig.upperSupportRoleId
            : guildConfig.generalSupportRoleId;

        if (!supportRoleId) {
          return interaction.reply({
            content: 'Support role is not configured. Please contact an administrator.',
            flags: 64,
          });
        }

        await interaction.reply({ content: 'Support team has been notified.', flags: 64 });
        await interaction.channel.send({ content: `<@&${supportRoleId}>` });
      }
    } catch (error) {
      console.error('[TicketSystem] Error in ticket system handler:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while processing your request. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
