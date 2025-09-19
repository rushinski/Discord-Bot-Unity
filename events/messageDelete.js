/**
 * Event: messageDelete
 * ----------------------------------------
 * Purpose:
 * - Logs deleted messages for moderation visibility.
 *
 * Behavior:
 * - Excludes bot messages.
 * - Fetches guild configuration to find the moderation log channel.
 * - Creates a structured embed containing:
 *   - Author info
 *   - Nickname
 *   - User ID
 *   - Original message time
 *   - Deletion time
 *   - Channel reference
 *   - Message content (truncated if too long)
 *
 * Dependencies:
 * - schemas/config.js (fetches moderation log channel ID)
 *
 * Notes:
 * - Uses Discord timestamp formatting for human-readable logs.
 * - Silently ignores if moderation log channel is missing.
 */

const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || !message.author || message.author.bot) return;

    try {
      // Fetch guild configuration
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig?.moderationLogChannel) return;

      const logChannel = message.guild.channels.cache.get(guildConfig.moderationLogChannel);
      if (!logChannel) return;

      // Prepare message content
      const messageContent = message.content?.trim() || 'No content';
      const MAX_FIELD_LENGTH = 1024;
      const truncate = (content) =>
        content.length > MAX_FIELD_LENGTH ? content.slice(0, MAX_FIELD_LENGTH - 3) + '...' : content;

      // Fetch user details
      const user = message.author;
      const nickname = message.member?.nickname || 'None';

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('🗑️ Message Deleted')
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
          { name: 'Message Content', value: truncate(messageContent), inline: false },
        )
        .setTimestamp();

      // Send embed to log channel
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error logging deleted message:', error);

      // Attempt fallback: notify admins in log channel if possible
      try {
        const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
        if (guildConfig?.moderationLogChannel) {
          const logChannel = message.guild.channels.cache.get(guildConfig.moderationLogChannel);
          if (logChannel) {
            await logChannel.send({
              content: `❌ Failed to log a deleted message. Check bot logs for details.`,
            });
          }
        }
      } catch {
        // Final fallback: console-only
      }
    }
  },
};
