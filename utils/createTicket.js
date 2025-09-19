/**
 * File: utils/createTicket.js
 * Purpose: Central utility for creating both generic and verification tickets.
 * Notes:
 * - Provides modal handling for generic tickets.
 * - Dynamically resolves roles and categories from GuildConfig.
 * - Saves ticket data to the database and sets up initial channel state.
 */

const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js');
const Ticket = require('../schemas/ticket');

const createTicket = {
  /**
   * Shows a modal for user to describe their issue.
   * Used when selecting a generic ticket type from dropdown.
   */
  async showDescriptionModal(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('ticketDescriptionModal')
        .setTitle('Describe Your Issue');

      const descriptionInput = new TextInputBuilder()
        .setCustomId('ticketDescription')
        .setLabel('Please describe your issue:')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Provide as much detail as possible.')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(descriptionInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('[TicketSystem] Error showing description modal:', error);
      await interaction.reply({
        content: 'Unable to open the description modal. Please try again later.',
        flags: 64,
      });
    }
  },

  /**
   * Creates a new ticket channel, saves it to DB, and sets up initial state.
   */
  async create(interaction, ticketType, description, guildConfig, isVerification = false) {
    try {
      const user = interaction.user;
      const guild = interaction.guild;

      // Validate category configuration
      if (!guildConfig.createdTicketCategory) {
        return interaction.reply({
          content: 'Ticket system is not configured. Please set a ticket category using `/configure`.',
          flags: 64,
        });
      }

      // Resolve support role dynamically
      let supportRoleId = guildConfig.generalSupportRoleId;
      if (ticketType === 'application' || ticketType === 'rss_sellers') {
        supportRoleId = guildConfig.upperSupportRoleId;
      } else if (isVerification) {
        supportRoleId = guildConfig.verificationRoleId || guildConfig.upperSupportRoleId;
      }

      if (!supportRoleId) {
        return interaction.reply({
          content: 'Support role is not configured. Please contact an administrator.',
          flags: 64,
        });
      }

      // Define permissions
      const permissions = [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // deny everyone
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // ticket creator
        { id: supportRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // support
      ];

      // Create channel
      const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: guildConfig.createdTicketCategory,
        permissionOverwrites: permissions,
      });

      // Save ticket to DB
      const ticket = new Ticket({
        userId: user.id,
        channelId: channel.id,
        guildId: guild.id,
        ticketType,
        description: description || (isVerification ? 'Verification process started.' : null),
      });
      await ticket.save();

      // Create ticket embed
      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${isVerification ? 'Verification Ticket' : `${ticketType} Ticket`}`)
        .setDescription(
          `**A new ticket has been created.**\n\n` +
          `👤 **User Info:**\n- Username: ${user.tag}\n- ID: ${user.id}\n\n` +
          (description ? `📝 **Issue Details:**\n- ${description}` : '')
        )
        .setFooter({ text: 'Support Team will assist you shortly.' })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      // Buttons
      const closeButton = new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const pingButton = new ButtonBuilder()
        .setCustomId('pingSupport')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const components = [new ActionRowBuilder().addComponents(pingButton, closeButton)];

      // Send ticket message
      const message = await channel.send({
        content: `<@&${supportRoleId}> | <@${user.id}>`,
        embeds: [ticketEmbed],
        components,
      });

      await message.pin();

      // Confirmation reply
      await interaction.reply({
        content: `Ticket created successfully: ${channel}`,
        flags: 64,
      });

      console.log(`[TicketSystem] 🎟️ Created ${ticketType} ticket for ${user.tag} in guild ${guild.id}`);
    } catch (error) {
      console.error('[TicketSystem] Error creating ticket:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while creating your ticket. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};

module.exports = createTicket;
