/**
 * File: utils/createTicket.js
 * Purpose: Creates a general-purpose ticket channel for the guild.
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

module.exports = {
  async showDescriptionModal(interaction) {
    // existing modal logic (unchanged)
  },

  async create(interaction, ticketType, description, guildConfig) {
    try {
      const guild = interaction.guild;

      // Prevent duplicate open tickets
      const existingTicket = await Ticket.findOne({
        userId: interaction.user.id,
        guildId: guild.id,
        status: { $ne: 'closed' },
      });

      if (existingTicket) {
        return interaction.reply({
          content: `You already have an open ticket: <#${existingTicket.channelId}>`,
          flags: 64,
        });
      }

      // Create ticket channel
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
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
          },
        ],
      });

      // Save ticket in DB
      await Ticket.create({
        userId: interaction.user.id,
        guildId: guild.id,
        channelId: channel.id,
        ticketType,
        status: 'open',
        description,
      });

      // Create ticket embed
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket`)
        .setDescription(
          `Welcome <@${interaction.user.id}>!\n\n` +
          `This is your private ticket channel.\n\n` +
          `Use the buttons below to ping support or close the ticket when done.`
        )
        .setFooter({ text: `${guild.name} • Ticket System` })
        .setTimestamp();

      // Create Ping Support + Close Ticket buttons
      const pingButton = new ButtonBuilder()
        .setCustomId('ping-support')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const closeButton = new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(pingButton, closeButton);

      // Send embed + buttons
      await channel.send({
        content: `<@${interaction.user.id}> Your ticket has been created.`,
        embeds: [embed],
        components: [row],
      });

      console.log(`[TicketSystem] 🎟️ Created ${ticketType} ticket for ${interaction.user.tag} in guild ${guild.id}`);

      return interaction.reply({
        content: `Your ${ticketType} ticket has been created: <#${channel.id}>`,
        flags: 64,
      });
    } catch (error) {
      console.error('[TicketSystem] ❌ Error creating ticket:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while creating the ticket. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
