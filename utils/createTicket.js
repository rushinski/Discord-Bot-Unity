/**
 * File: utils/createTicket.js
 * Purpose: Provides utility functions for creating general support tickets.
 *
 * Responsibilities:
 * - Show a modal to collect a user’s description of their issue.
 * - Create a dedicated private channel for the ticket.
 * - Save the ticket to the database for tracking.
 * - Provide staff and users with structured controls (ping support, close ticket).
 *
 * Notes for Recruiters:
 * This utility handles the creation of general support tickets.
 * Each ticket is represented by a private text channel that is only visible to the user,
 * the bot, and designated support staff. Tickets remain open until manually closed.
 */

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder: ComponentRow,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const Ticket = require('../schemas/ticket');
const GuildConfig = require('../schemas/config');

module.exports = {
  /**
   * Show a modal asking the user for a description of their issue.
   * @param {object} interaction - Discord interaction object.
   * @param {string} ticketType - Type of ticket selected.
   */
  async showDescriptionModal(interaction, ticketType) {
    const modal = new ModalBuilder()
      .setCustomId(`ticketDescription-${ticketType}`)
      .setTitle('Ticket Description');

    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Please describe your issue')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(descriptionInput));
    await interaction.showModal(modal);
  },

  /**
   * Create a new support ticket channel and save it to the database.
   * @param {object} interaction - Discord interaction object.
   * @param {string} ticketType - The type of ticket being created.
   * @param {string} description - Description provided by the user.
   */
  async create({ interaction, ticketType, description }) {
    try {
      const guild = interaction.guild;

      // Load guild configuration
      const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
      if (!guildConfig || !guildConfig.createdTicketCategory) {
        return interaction.reply({
          content:
            'The ticket system is not configured. Please set a ticket category using `/configure-ticket-system`.',
          flags: 64,
        });
      }

      // Prevent duplicate open tickets for the same user and type
      const existingTicket = await Ticket.findOne({
        userId: interaction.user.id,
        guildId: guild.id,
        ticketType,
        status: { $ne: 'closed' },
      });

      if (existingTicket) {
        return interaction.reply({
          content: `You already have an open ticket: <#${existingTicket.channelId}>`,
          flags: 64,
        });
      }

      // Create a private channel for the ticket
      const channel = await guild.channels.create({
        name: `${ticketType}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: guildConfig.createdTicketCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
            ],
          },
        ],
      });

      // Save the new ticket in the database
      await Ticket.create({
        userId: interaction.user.id,
        guildId: guild.id,
        channelId: channel.id,
        ticketType,
        description,
        status: 'open',
      });

      // Construct a ticket embed
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Support Ticket')
        .setDescription(
          `Hello <@${interaction.user.id}>,\n\n` +
            `This is your private support ticket for **${ticketType}**.\n` +
            `A staff member will respond to your request as soon as possible.\n\n` +
            `Use the buttons below to notify support or close this ticket.`
        )
        .setFooter({ text: `${guild.name} • Ticket System` })
        .setTimestamp();

      // Create action buttons for the ticket
      const pingButton = new ButtonBuilder()
        .setCustomId('ping-support')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const closeButton = new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const row = new ComponentRow().addComponents(pingButton, closeButton);

      // Send ticket embed to the new channel
      await channel.send({
        content: `<@${interaction.user.id}> A staff member will assist you shortly.`,
        embeds: [embed],
        components: [row],
      });

      console.log(
        `[TicketSystem] Created support ticket (${ticketType}) for ${interaction.user.tag} in guild ${guild.id}`
      );

      // Confirm ticket creation to the user
      return interaction.reply({
        content: `Your support ticket has been created: <#${channel.id}>`,
        flags: 64,
      });
    } catch (error) {
      console.error('[TicketSystem] Error creating support ticket:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while creating your ticket. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
