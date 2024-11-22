const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Sends the verification embed'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('Verification')
    .setDescription('**React to this message with the ✅ emoji to verify yourself** and gain access to the rest of the server!')
    .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the embed and fetch the message
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });

    // Save the message ID to a file
    fs.writeFileSync('txtIds/verifyReactionId.txt', message.id);

    // Add reactions to the message
    await message.react('✅'); // Verify role emoji
  },
};
