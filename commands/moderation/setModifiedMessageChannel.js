const { SlashCommandBuilder } = require('discord.js');
const MessageLogChannel = require('../../schemas/config'); // Corrected import

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('set-modified-message-channel')
    .setDescription('Sets the channel for message logs')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to log messages').setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    
    // Save the channel ID to MongoDB
    await MessageLogChannel.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { channelId: channel.id } },
      { upsert: true }
    );

    await interaction.reply({ content: `Message logs will be sent to ${channel}`, ephemeral: true });
  }
};
