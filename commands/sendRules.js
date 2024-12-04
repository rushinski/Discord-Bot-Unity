const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-rules')
    .setDescription('Sends the server rules.'),

  async execute(interaction) {
    const verifyEmbed = new EmbedBuilder()
      .setTitle('Server Rules 📜')
      .setDescription(
        '**The server is pretty chill but obviously there has to be some rules:**\n' +
        '1. **Respect others.**\n' +
        '2. **Promoting other jump groups in our server** will result in a **ban**.\n' +
        '3. **Hateful racism and homophobia** is not permitted.\n' +
        '4. No spam!'
      )
      .setColor('Green')
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    try {
      // Send the embed to the current channel without replying to the user
      await interaction.channel.send({ embeds: [verifyEmbed] });
    } catch (error) {
      console.error('Error sending embed:', error);
      await interaction.reply({ content: 'There was an error sending the rules.', ephemeral: true });
    }
  }
};
