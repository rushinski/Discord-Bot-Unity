const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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
      if (!ticketType) {
        return interaction.reply({ content: 'Please select a ticket type before submitting.', ephemeral: true });
      }

      // Create the ticket channel in the specific category
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: '1280301664514867292', // Category ID for tickets
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Hide from everyone else
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: '1306333653608960082', // R4 role ID
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: '1306333607018893322', // Helper role ID
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      // Create the embed message for the ticket channel
      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${ticketType} Ticket`)
        .setDescription(`This ticket was opened by **${interaction.user.tag}** for the following reason:`)
        .addFields(
          { name: 'Ticket Reason', value: `**${ticketType}**`, inline: false },
          { name: 'Requested By', value: interaction.user.tag, inline: false }
        )
        .setFooter({ text: 'Please click the button below when you are done.' })
        .setTimestamp();

      // Create the "Close Ticket" button
      const closeButton = new ButtonBuilder()
        .setCustomId('closeTicket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const closeRow = new ActionRowBuilder().addComponents(closeButton);

      // Send the embed message in the ticket channel with the close button
      await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [closeRow],
      });

      await interaction.reply({ content: `Ticket created! Check ${ticketChannel}`, ephemeral: true });
    }

    // Handle ticket closure
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
      // Confirm the interaction is happening in a ticket channel
      if (interaction.channel && interaction.channel.name.startsWith('ticket-')) {
        await interaction.reply({ content: 'Closing ticket...', ephemeral: true });

        setTimeout(() => interaction.channel.delete().catch(console.error), 3000); // Delay to allow response to be sent
      } else {
        await interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
      }
    }
  },
};
