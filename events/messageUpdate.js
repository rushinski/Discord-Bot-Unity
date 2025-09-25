/**
 * File: messageUpdate.js
 * Purpose: Logs message edits for moderation and accountability.
 *
 * Responsibilities:
 * - Detect when a user edits a message (excluding bot messages).
 * - Ensure logs only trigger if message content has changed.
 * - Record author details, timestamps, old content, new content, and channel reference.
 *
 * Notes for Recruiters:
 * This module ensures transparency by capturing message edits.
 * Moderators can see both the original and edited content for review.
 */

const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // Ignore bot messages and non-content changes
    if (!oldMessage.guild || oldMessage.content === newMessage.content || oldMessage.author?.bot) {
      return;
    }

    try {
      // Retrieve guild-specific configuration
      const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
      if (!guildConfig?.moderationLogChannel) return;

      const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
      if (!logChannel) return;

      // Ensure valid content and truncate if necessary
      const oldContent = oldMessage.content?.trim() || 'No content';
      const newContent = newMessage.content?.trim() || 'No content';
      const MAX_FIELD_LENGTH = 1024;
      const truncate = (content) =>
        content.length > MAX_FIELD_LENGTH ? content.slice(0, MAX_FIELD_LENGTH - 3) + '...' : content;

      const user = oldMessage.author || newMessage.author;
      const nickname = oldMessage.member?.nickname || 'None';

      const oldTimestamp = oldMessage.createdAt
        ? `<t:${Math.floor(oldMessage.createdAt.getTime() / 1000)}:F>`
        : 'Unknown';
      const editedTimestamp = newMessage.editedAt
        ? `<t:${Math.floor(newMessage.editedAt.getTime() / 1000)}:F>`
        : 'Unknown';

      // Create structured embed
      const embed = new EmbedBuilder()
        .setTitle('Message Edited')
        .setColor('Yellow')
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: 'Author', value: `${user.tag} (<@${user.id}>)`, inline: true },
          { name: 'Nickname', value: nickname, inline: true },
          { name: 'User ID', value: user.id, inline: true },
          { name: 'Original Time', value: oldTimestamp, inline: true },
          { name: 'Edited Time', value: editedTimestamp, inline: true },
          { name: 'Channel', value: `<#${oldMessage.channel?.id || 'Unknown Channel'}>`, inline: false },
          { name: 'Old Content', value: truncate(oldContent), inline: false },
          { name: 'New Content', value: truncate(newContent), inline: false }
        )
        .setTimestamp();

      // Send embed to moderation log channel
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('[messageUpdate] Error logging edited message:', error);

      // Attempt minimal fallback notification
      try {
        const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
        if (guildConfig?.moderationLogChannel) {
          const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
          if (logChannel) {
            await logChannel.send({
              content: `A message edit by <@${oldMessage.author?.id}> could not be fully logged. See bot logs for details.`,
            });
          }
        }
      } catch {
        // Final fallback: console only
      }
    }
  },
};
