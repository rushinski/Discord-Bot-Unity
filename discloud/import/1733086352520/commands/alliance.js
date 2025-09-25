const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('alliance-select')
    .setDescription('Sends alliance selection button'),
  async execute(interaction, client) {
    try {
      // Defer the reply to give us time to process
      await interaction.deferReply({ ephemeral: true });

      // Create buttons for alliance selection
      const alliance1 = new ButtonBuilder()
        .setCustomId('1276952978695127223')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Lunar Templars');

      const alliance2 = new ButtonBuilder()
        .setCustomId('1276953167636070413')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Lunar Knights');

      // Create the action row and add buttons
      const row = new ActionRowBuilder()
        .addComponents(alliance1)
        .addComponents(alliance2);

      // Fetch the channel and send the message
      const channel = await client.channels.fetch(interaction.channelId);
      await channel.send({
        content: `**Click one of the buttons to pick which alliance you'd like to join:**`,
        components: [row],
      });

      // Optionally, acknowledge the original interaction
      await interaction.editReply({
        content: 'The alliance selection buttons have been sent!',
      });
      
    } catch (error) {
      console.error('Error handling interaction:', error);
      await interaction.editReply({
        content: 'An error occurred while processing your request.',
      });
    }
  }
};
