const { EmbedBuilder } = require('discord.js');
const MessageLogChannel = require('../schemas/config');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    // Ensure this runs for deletable messages
    if (!message.guild || !message.author) return;

    // Get the log channel ID from the database
    const logChannelData = await MessageLogChannel.findOne({ guildId: message.guild.id });
    if (!logChannelData) return;

    const logChannel = message.guild.channels.cache.get(logChannelData.channelId);
    if (!logChannel) return;

    // Create an embed for the deleted message
    const embed = new EmbedBuilder()
      .setTitle('Message Deleted')
      .setColor('Red')
      .addFields(
        { name: 'Author', value: `${message.author.tag} (<@${message.author.id}>)` },
        { name: 'Message', value: message.content || 'No content' }
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' })

    // Send the embed to the log channel
    logChannel.send({ embeds: [embed] });
  },
};
