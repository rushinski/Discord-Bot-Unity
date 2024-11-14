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
        { label: 'Questions', value: 'questions', description: 'Ask a question' },
      ]);

    const submitButton = new ButtonBuilder()
      .setCustomId('submitTicket')
      .setLabel('Submit')
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(ticketSelectMenu);
    const row2 = new ActionRowBuilder().addComponents(submitButton);

    await interaction.reply({
      embeds: [ticketEmbed],
      components: [row1, row2],
      ephemeral: false,
    });
  },
};
