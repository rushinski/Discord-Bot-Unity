const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config'); // Use the unified schema

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // Ensure this runs when a message is edited
    if (
      oldMessage.content === newMessage.content || // No content change
      oldMessage.author.bot // Ignore bot messages
    ) {
      return;
    }

    // Fetch guild configuration
    const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
    if (!guildConfig || !guildConfig.moderationLogChannel) return;

    // Get the log channel using the stored ID
    const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
    if (!logChannel) return;

    // Handle missing or empty content gracefully
    const oldContent = oldMessage.content?.trim() || 'No content';
    const newContent = newMessage.content?.trim() || 'No content';

    // Create an embed for the edited message
    const embed = new EmbedBuilder()
      .setTitle('Message Edited')
      .setColor('Yellow')
      .addFields(
        { name: 'Author', value: `${oldMessage.author.tag} (<@${oldMessage.author.id}>)` },
        { name: 'Old Message', value: oldContent, inline: false },
        { name: 'New Message', value: newContent, inline: false },
        { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the embed to the log channel
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send the embed:', error);
    }
  },
};
