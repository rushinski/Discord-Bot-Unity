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
        '**Rules in this server will be enforced with a 3 strike system. Three rule breaks and you will be banned.' +
        '1. **Respect others.**\n' +
        '2. **Promoting other groups in our server will result in a ban.**\n' +
        '3. **No hate speach.**\n' +
        '4. **No spam!**'
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
