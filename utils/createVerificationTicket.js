/**
 * File: utils/createVerificationTicket.js
 * Purpose: Creates a dedicated verification ticket channel for a user.
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
  async create({ interaction, targetUser }) {
    try {
      const guild = interaction.guild;

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
        parent: guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === 'Tickets')?.id,
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
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
          },
        ],
      });

      // Save ticket in DB
      await Ticket.create({
        userId: targetUser.id,
        guildId: guild.id,
        channelId: channel.id,
        ticketType: 'verification',
        status: 'open',
      });

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Verification Ticket')
        .setDescription(
          `Welcome <@${targetUser.id}>!\n\n` +
          `This is your private verification ticket. A staff member will review your request.\n\n` +
          `Staff can use the buttons below to **Ping Support**, **Verify User**, or **Close** the ticket.`
        )
        .setFooter({ text: `${guild.name} • Verification System` })
        .setTimestamp();

      // Create buttons
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

      // Send embed + buttons to channel
      await channel.send({
        content: `<@${targetUser.id}> A staff member will assist you shortly.`,
        embeds: [embed],
        components: [row],
      });

      console.log(`[TicketSystem] 🎟️ Created verification ticket for ${targetUser.tag} in guild ${guild.id}`);

      return interaction.reply({
        content: `Verification ticket created: <#${channel.id}>`,
        flags: 64,
      });
    } catch (error) {
      console.error('[TicketSystem] ❌ Error creating verification ticket:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while creating the verification ticket. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
