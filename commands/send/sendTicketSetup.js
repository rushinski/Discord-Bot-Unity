const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-ticket-setup')
    .setDescription('Sets up the ticket system'),

  async execute(interaction) {
    const ticketEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('Ticket Support')
      .setDescription(
        `Please select the type of ticket you wish to create from the dropdown menu below and click **Submit**. Available options include:
        
        🎓 **R4/R5 Application**: Apply for an R4 or R5 role.
        🌾 **RSS Seller Application**: Apply for an RSS seller role.
        🛠️ **Help**: Request general assistance.
        📋 **Complaints**: File a formal complaint.
        💡 **Suggestions**: Share your ideas or improvements.
        ❓ **Other**: For any issues not listed above.`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const ticketSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticketType')
      .setPlaceholder('Select Ticket Type')
      .addOptions([
        {
          label: 'R4/R5 Application',
          value: 'application',
          description: 'Apply for an R4 or R5 role',
          emoji: '🎓',
        },
        {
          label: 'RSS Seller Application',
          value: 'rss_sellers',
          description: 'Apply for an RSS seller role',
          emoji: '🌾',
        },
        {
          label: 'Help',
          value: 'help',
          description: 'Request general assistance',
          emoji: '🛠️',
        },
        {
          label: 'Complaints',
          value: 'complaints',
          description: 'File a formal complaint',
          emoji: '📋',
        },
        {
          label: 'Suggestions',
          value: 'suggestions',
          description: 'Share your ideas or improvements',
          emoji: '💡',
        },
        {
          label: 'Other',
          value: 'other',
          description: 'For any issues not listed above',
          emoji: '❓',
        },
      ]);

    const row1 = new ActionRowBuilder().addComponents(ticketSelectMenu);

    await interaction.reply({
      embeds: [ticketEmbed],
      components: [row1],
      ephemeral: false,
    });
  },
};
