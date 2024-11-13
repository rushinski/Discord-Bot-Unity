const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticketType') {
      // Store the selected ticket type in user context
      interaction.client.userSelectedTicketType = interaction.values[0];
      await interaction.reply({ content: 'Ticket type selected. Now click "Submit" to create your ticket.', ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'submitTicket') {
      const ticketType = interaction.client.userSelectedTicketType;
      if (!ticketType) {
        return interaction.reply({ content: 'Please select a ticket type before submitting.', ephemeral: true });
      }

      // Create the ticket channel
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
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
            id: '1306333653608960082', // Replace with actual R4 role ID
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: '1306333607018893322', // Replace with actual helper role ID
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      // Send a welcome message in the new ticket channel
      await ticketChannel.send(`Welcome, ${interaction.user}! Your ${ticketType} ticket has been created. Our support team will assist you soon.`);
      await interaction.reply({ content: `Ticket created! Check ${ticketChannel}`, ephemeral: true });
    }
  },
};
