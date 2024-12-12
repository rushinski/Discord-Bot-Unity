const { SlashCommandBuilder } = require('discord.js');
const MessageLogChannel = require('../../schemas/config'); // Corrected import

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('unset-modified-message-channel')
    .setDescription('Unsets the message log channel'),

  async execute(interaction) {
    // Remove the channel ID from MongoDB
    await MessageLogChannel.findOneAndDelete({ guildId: interaction.guild.id });

    await interaction.reply({ content: 'Message log channel has been unset', ephemeral: true });
  }
};
