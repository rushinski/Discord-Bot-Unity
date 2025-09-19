/**
 * Event: messageUpdate
 * ----------------------------------------
 * Purpose:
 * - Logs when a message is edited for moderation visibility.
 *
 * Behavior:
 * - Excludes bot messages.
 * - Only runs if content actually changed.
 * - Fetches guild configuration to find the moderation log channel.
 * - Creates a structured embed containing:
 *   - Author info
 *   - Nickname
 *   - User ID
 *   - Original message time
 *   - Edited time
 *   - Channel reference
 *   - Old content
 *   - New content
 *
 * Dependencies:
 * - schemas/config.js (fetches moderation log channel ID)
 *
 * Notes:
 * - Uses Discord timestamp formatting for readability.
 * - Silently ignores if moderation log channel is missing.
 */

const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // Ignore bot messages or no content change
    if (
      oldMessage.content === newMessage.content ||
      oldMessage.author?.bot
    ) {
      return;
    }

    try {
      // Fetch guild configuration
      const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild?.id });
      if (!guildConfig?.moderationLogChannel) return;

      const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
      if (!logChannel) return;

      // Handle missing or empty content
      const oldContent = oldMessage.content?.trim() || 'No content';
      const newContent = newMessage.content?.trim() || 'No content';

      // Truncate long content
      const MAX_FIELD_LENGTH = 1024;
      const truncate = (content) =>
        content.length > MAX_FIELD_LENGTH ? content.slice(0, MAX_FIELD_LENGTH - 3) + '...' : content;

      // User details
      const user = oldMessage.author || newMessage.author;
      const nickname = oldMessage.member?.nickname || 'None';

      // Message timestamps
      const oldTimestamp = oldMessage.createdAt
        ? `<t:${Math.floor(oldMessage.createdAt.getTime() / 1000)}:F>`
        : 'Unknown';
      const editedTimestamp = newMessage.editedAt
        ? `<t:${Math.floor(newMessage.editedAt.getTime() / 1000)}:F>`
        : 'Unknown';

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('✏️ Message Edited')
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
          { name: 'New Content', value: truncate(newContent), inline: false },
        )
        .setTimestamp();

      // Send embed
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error logging edited message:', error);

      // Attempt fallback: notify admins
      try {
        const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild?.id });
        if (guildConfig?.moderationLogChannel) {
          const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
          if (logChannel) {
            await logChannel.send({
              content: `❌ Failed to log a message edit for <@${oldMessage.author?.id}>. Check bot logs for details.`,
            });
          }
        }
      } catch {
        // Final fallback: console only
      }
    }
  },
};
