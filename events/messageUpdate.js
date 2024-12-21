const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config'); // Use the unified schema

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // Ensure this runs when a message is edited
    if (
      oldMessage.content === newMessage.content || // No content change
      oldMessage.author?.bot // Ignore bot messages
    ) {
      return;
    }

    // Fetch guild configuration
    const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild?.id });
    if (!guildConfig || !guildConfig.moderationLogChannel) return;

    // Get the log channel using the stored ID
    const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
    if (!logChannel) return;

    // Handle missing or empty content gracefully
    const oldContent = oldMessage.content?.trim() || 'No content';
    const newContent = newMessage.content?.trim() || 'No content';

    // Truncate long content to fit Discord's limits
    const MAX_FIELD_LENGTH = 1024;
    const truncate = (content) =>
      content.length > MAX_FIELD_LENGTH ? content.slice(0, MAX_FIELD_LENGTH - 3) + '...' : content;

    // User details
    const user = oldMessage.author || newMessage.author;
    const nickname = oldMessage.member?.nickname || 'No nickname';
    const userId = user.id;
    const username = user.tag;

    // Message details
    const oldTimestamp = oldMessage.createdAt.toISOString();
    const editedTimestamp = newMessage.editedAt?.toISOString() || 'Unknown';

    const embed = new EmbedBuilder()
      .setTitle('Message Edited')
      .setColor('Yellow')
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'Author', value: username, inline: true },
        { name: 'Nickname', value: nickname, inline: true },
        { name: 'User ID', value: userId, inline: true },
        { name: 'Original Message Time (UTC)', value: oldTimestamp, inline: true },
        { name: 'Edited Time (UTC)', value: editedTimestamp, inline: true },
        { name: 'Channel', value: `<#${oldMessage.channel?.id || 'Unknown Channel'}>`, inline: false },
        { name: 'Old Message', value: truncate(oldContent), inline: false },
        { name: 'New Message', value: truncate(newContent), inline: false }
      )
      .setTimestamp()
      .setFooter({
        text: 'Message moderation logs',
        iconURL: oldMessage.guild.iconURL({ dynamic: true }) || undefined,
      });

    // Send the embed to the log channel
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send the embed:', error);
    }
  },
};
