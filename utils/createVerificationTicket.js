/**
 * File: utils/createVerificationTicket.js
 * Purpose: Provides utility for creating verification ticket channels.
 *
 * Responsibilities:
 * - Create a private ticket channel for verifying a user.
 * - Prevent duplicate open verification tickets for the same user.
 * - Save ticket data to the database for tracking.
 * - Provide staff with action buttons (verify user, ping support, close ticket).
 *
 * Notes for Recruiters:
 * This utility is part of the verification system.
 * A verification ticket ensures new users are manually reviewed before gaining access.
 * The workflow is similar to general support tickets but includes a "Verify User" button.
 */

const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const Ticket = require('../schemas/ticket');
const GuildConfig = require('../schemas/config');

module.exports = {
  /**
   * Creates a new verification ticket for a given user.
   * @param {object} options - Parameters for ticket creation.
   * @param {object} options.interaction - The Discord interaction that triggered the ticket.
   * @param {object} options.targetUser - The user being verified.
   */
  async create({ interaction, targetUser }) {
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

      // Prevent duplicate open verification tickets
      const existingTicket = await Ticket.findOne({
        userId: targetUser.id,
        guildId: guild.id,
        ticketType: 'verification',
        status: { $ne: 'closed' },
      });

      if (existingTicket) {
        return interaction.reply({
          content: `You already have an open verification ticket: <#${existingTicket.channelId}>`,
          flags: 64,
        });
      }

      // Create private channel for verification
      const channel = await guild.channels.create({
        name: `verify-${targetUser.username}`,
        type: ChannelType.GuildText,
        parent: guildConfig.createdTicketCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: targetUser.id,
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

      // Save verification ticket to the database
      await Ticket.create({
        userId: targetUser.id,
        guildId: guild.id,
        channelId: channel.id,
        ticketType: 'verification',
        status: 'open',
      });

      // Construct ticket embed
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Verification Ticket')
        .setDescription(
          `Welcome <@${targetUser.id}>!\n\n` +
            `This is your private verification ticket. A staff member will review your request.\n\n` +
            `Staff can use the buttons below to **Ping Support**, **Verify User**, or **Close Ticket**.`
        )
        .setFooter({ text: `${guild.name} • Verification System` })
        .setTimestamp();

      // Create action buttons
      const verifyButton = new ButtonBuilder()
        .setCustomId('verify-ticket-user')
        .setLabel('Verify User')
        .setStyle(ButtonStyle.Success);

      const pingButton = new ButtonBuilder()
        .setCustomId('ping-support')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const closeButton = new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(verifyButton, pingButton, closeButton);

      // Send embed + buttons to the ticket channel
      await channel.send({
        content: `<@${targetUser.id}> A staff member will assist you shortly.`,
        embeds: [embed],
        components: [row],
      });

      console.log(
        `[TicketSystem] Created verification ticket for ${targetUser.tag} in guild ${guild.id}`
      );

      return interaction.reply({
        content: `Verification ticket created: <#${channel.id}>`,
        flags: 64,
      });
    } catch (error) {
      console.error('[TicketSystem] Error creating verification ticket:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content:
            'An error occurred while creating the verification ticket. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
