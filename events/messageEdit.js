const { EmbedBuilder } = require('discord.js');
const MessageLogChannel = require('../schemas/config');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // Ensure this runs when a message is edited
    if (oldMessage.content === newMessage.content) {
      return; // No content change, skip
    }

    // Get the log channel ID from the database
    const logChannelData = await MessageLogChannel.findOne({ guildId: oldMessage.guild.id });
    if (!logChannelData) return;

    const logChannel = oldMessage.guild.channels.cache.get(logChannelData.channelId);
    if (!logChannel) return;

    // Create an embed for the edited message
    const embed = new EmbedBuilder()
      .setTitle('Message Edited')
      .setColor('Yellow')
      .addFields(
        { name: 'Author', value: `${oldMessage.author.tag} (<@${oldMessage.author.id}>)` },
        { name: 'Old Message', value: oldMessage.content || 'No content' },
        { name: 'New Message', value: newMessage.content || 'No content' }
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' })
      
    // Send the embed to the log channel
    logChannel.send({ embeds: [embed] });
  },
};
