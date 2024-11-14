const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const openTickets = new Map(); // Map to store userId and their ticket channel ID

// Define role IDs for R4 Application Support and General Support roles
const R4_APPLICATION_SUPPORT_ROLE = '1306333653608960082'; // Replace with your R4 Application Support role ID
const GENERAL_SUPPORT_ROLE = '1306333607018893322'; // Replace with your General Support role ID

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle ticket type selection
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticketType') {
      interaction.client.userSelectedTicketType = interaction.values[0];
      await interaction.reply({ content: 'Ticket type selected. Now click "Submit" to create your ticket.', ephemeral: true });
    }

    // Handle ticket submission
    if (interaction.isButton() && interaction.customId === 'submitTicket') {
      const ticketType = interaction.client.userSelectedTicketType;

      // Check if user already has an open ticket
      if (openTickets.has(interaction.user.id)) {
        return interaction.reply({ content: 'You already have an open ticket. Please close it before creating a new one.', ephemeral: true });
      }

      if (!ticketType) {
        return interaction.reply({ content: 'Please select a ticket type before submitting.', ephemeral: true });
      }

      // Determine the appropriate support role and permissions
      let supportRoleId, permissions;
      if (ticketType === 'application') {
        supportRoleId = R4_APPLICATION_SUPPORT_ROLE;
        permissions = [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Hide from everyone else
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: R4_APPLICATION_SUPPORT_ROLE,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ];
      } else {
        supportRoleId = GENERAL_SUPPORT_ROLE;
        permissions = [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Hide from everyone else
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: GENERAL_SUPPORT_ROLE,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ];
      }

      // Create the ticket channel in the specific category with appropriate permissions
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: '1280301664514867292', // Category ID for tickets
        permissionOverwrites: permissions,
      });

      // Store the ticket channel ID to prevent multiple tickets
      openTickets.set(interaction.user.id, ticketChannel.id);

      // Create the embed message for the ticket channel
      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${ticketType} Ticket`)
        .setDescription(`This ticket was opened by **${interaction.user.tag}** for the following reason:`)
        .addFields(
          { name: 'Ticket Reason', value: `**${ticketType}**`, inline: false },
          { name: 'Requested By', value: `<@${interaction.user.id}>`, inline: false }, // Ping the user
          { name: 'Support Role', value: `<@&${supportRoleId}>`, inline: false } // Ping the support role
        )
        .setFooter({ text: 'Please click the button below when you are done.' })
        .setTimestamp();

      // Create the "Close Ticket" button
      const closeButton = new ButtonBuilder()
        .setCustomId('closeTicket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const closeRow = new ActionRowBuilder().addComponents(closeButton);

      // Send the embed message in the ticket channel with the close button and pin it
      const message = await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [closeRow],
      });
      await message.pin(); // Pin the ticket embed message

      await interaction.reply({ content: `Ticket created! Check ${ticketChannel}`, ephemeral: true });
    }

    // Handle ticket closure
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
      // Confirm the interaction is happening in a ticket channel
      if (interaction.channel && interaction.channel.name.startsWith('ticket-')) {
        await interaction.reply({ content: 'Closing ticket...', ephemeral: true });

        // Remove the user from the openTickets map
        const ticketOwner = Array.from(openTickets).find(([, channelId]) => channelId === interaction.channel.id);
        if (ticketOwner) openTickets.delete(ticketOwner[0]);

        setTimeout(() => interaction.channel.delete().catch(console.error), 3000); // Delay to allow response to be sent
      } else {
        await interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
      }
    }
  },
};
