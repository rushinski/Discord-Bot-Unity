const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Sets up the ticket system'),

  async execute(interaction) {
    const ticketEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('Support Tickets')
      .setDescription('Select the type of ticket you want to create and click Submit.');

    const ticketSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticketType')
      .setPlaceholder('Select Ticket Type')
      .addOptions([
        { label: 'R4/R5 Application', value: 'application', description: 'Apply for R4/R5 role' },
        { label: 'Help', value: 'help', description: 'Request general help' },
        { label: 'Complaints', value: 'complaints', description: 'File a complaint' },
        { label: 'Suggestions', value: 'suggestions', description: 'Make a suggestion' },
        { label: 'Other', value: 'other', description: 'For anything else' },
      ]);

    const row1 = new ActionRowBuilder().addComponents(ticketSelectMenu);

    await interaction.reply({
      embeds: [ticketEmbed],
      components: [row1],
      ephemeral: false,
    });
  },
};
