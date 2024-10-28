const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
      .setName('verify-send')
      .setDescription('Sends the verification message to react to.'),

  async execute(interaction) {
    const verifyEmbed = new EmbedBuilder()
      .setTitle('Verification')
      .setDescription('**React to this message with the ✅ emoji to verify yourself** and gain access to the rest of the server!')
      .setColor('#7CFC00')
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });
  }
}