/**
 * File: messageDelete.js
 * Purpose: Logs deleted messages for moderation and accountability.
 *
 * Responsibilities:
 * - Detect when a user message is deleted (excluding bot messages).
 * - Log details including author, nickname, user ID, timestamps, channel, and message content.
 * - Ensure long messages are truncated for readability in logs.
 *
 * Notes for Recruiters:
 * This module helps moderators maintain transparency by tracking
 * message deletions and retaining critical context for review.
 */

const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || !message.author || message.author.bot) return;

    try {
      // Retrieve guild-specific configuration
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig?.moderationLogChannel) return;

      const logChannel = message.guild.channels.cache.get(guildConfig.moderationLogChannel);
      if (!logChannel) return;

      // Ensure content is valid and truncate if necessary
      const messageContent = message.content?.trim() || 'No content';
      const MAX_FIELD_LENGTH = 1024;
      const truncate = (content) =>
        content.length > MAX_FIELD_LENGTH ? content.slice(0, MAX_FIELD_LENGTH - 3) + '...' : content;

      const user = message.author;
      const nickname = message.member?.nickname || 'None';

      // Create structured embed
      const embed = new EmbedBuilder()
        .setTitle('Message Deleted')
        .setColor('Red')
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: 'Author', value: `${user.tag} (<@${user.id}>)`, inline: true },
          { name: 'Nickname', value: nickname, inline: true },
          { name: 'User ID', value: user.id, inline: true },
          {
            name: 'Message Sent',
            value: message.createdAt
              ? `<t:${Math.floor(message.createdAt.getTime() / 1000)}:F>`
              : 'Unknown',
            inline: true,
          },
          {
            name: 'Deleted At',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true,
          },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: false },
          { name: 'Message Content', value: truncate(messageContent), inline: false }
        )
        .setTimestamp();

      // Send embed to moderation log channel
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('[messageDelete] Error logging deleted message:', error);

      // Attempt minimal fallback notification
      try {
        const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
        if (guildConfig?.moderationLogChannel) {
          const logChannel = message.guild.channels.cache.get(guildConfig.moderationLogChannel);
          if (logChannel) {
            await logChannel.send({
              content: 'A message was deleted but could not be fully logged. See bot logs for details.',
            });
          }
        }
      } catch {
        // Final fallback: console only
      }
    }
  },
};
