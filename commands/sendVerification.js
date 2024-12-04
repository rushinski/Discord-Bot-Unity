const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Sends the verification embed'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Verification ✅')
      .setDescription('**React to this message with the ✅ emoji to verify yourself** and gain access to the rest of the server!')
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Defer the interaction to avoid timeout
    await interaction.deferReply({ ephemeral: true });

    // Ensure the txtIds directory exists
    const dirPath = path.join(__dirname, '..', 'txtIds');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Send the embed as a standalone message
    const message = await interaction.channel.send({ embeds: [embed] });

    // Save the message ID to a file
    const filePath = path.join(dirPath, 'verifyReactionId.txt');
    fs.writeFileSync(filePath, message.id);

    // Add reactions to the message
    await message.react('✅'); // Verify role emoji

    // Inform the user that the verification message has been sent
    await interaction.editReply({ content: 'Verification message has been sent.', ephemeral: true });
  },
};
