const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Sends verification button'),
  async execute(interaction, client) {
    try {
      // Defer the reply to give us time to process
      await interaction.deferReply({ ephemeral: true });

      // Create the verification button
      const button = new ButtonBuilder()
        .setCustomId('1245564960269144205')
        .setStyle(ButtonStyle.Success)
        .setLabel('Verify');

      // Create the action row and add the button
      const row = new ActionRowBuilder()
        .addComponents(button);

      // Fetch the channel and send the message
      const channel = await client.channels.fetch(interaction.channelId);
      await channel.send({
        content: '**Thank you for choosing to join us on our journey!**\n\nClick the **"verify"** button to gain access to the rest of the server:',
        components: [row],
      });

      // Optionally acknowledge the original interaction
      await interaction.editReply({
        content: 'The verification button has been sent!',
      });
      
    } catch (error) {
      console.error('Error handling interaction:', error);
      await interaction.editReply({
        content: 'An error occurred while processing your request.',
      });
    }
  }
};
