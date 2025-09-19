/**
 * Event: guildMemberRemove
 * ----------------------------------------
 * Purpose:
 * - Handles members leaving a server (voluntary, kicked, or banned).
 * - Logs the leave event with detailed user/account info.
 * - Updates the member count channel dynamically.
 *
 * Behavior:
 * - Detects whether the member left, was kicked, or banned.
 * - Sends a structured embed log to the configured join/leave log channel.
 * - Updates member count channel with the latest member count.
 *
 * Dependencies:
 * - schemas/config.js (fetches channel IDs for logging + member count)
 */

const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const Config = require('../schemas/config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    if (!member.guild) return;

    try {
      // Fetch guild configuration
      const configData = await Config.findOne({ guildId: member.guild.id });
      if (!configData) return;

      const { joinLeaveLogChannel, memberCountChannel } = configData;
      const logChannel = member.guild.channels.cache.get(joinLeaveLogChannel);
      const memberCountChannelInstance = member.guild.channels.cache.get(memberCountChannel);

      if (!logChannel) return;

      const joinTime = member.joinedAt;
      const leaveTime = new Date();
      const timeInServer = formatDuration(Math.floor((leaveTime - joinTime) / 1000));

      // Detect if user was banned or kicked
      let action = 'Left';
      try {
        // Check kick logs first
        const fetchedKickLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
        const kickLog = fetchedKickLogs.entries.first();
        if (kickLog && kickLog.target.id === member.id && (Date.now() - kickLog.createdTimestamp) < 5000) {
          action = 'Kicked';
        }
        else {
          // Then check ban logs
          const fetchedBanLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
          const banLog = fetchedBanLogs.entries.first();
          if (banLog && banLog.target.id === member.id && (Date.now() - banLog.createdTimestamp) < 5000) {
            action = 'Banned';
          }
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }

      // Leave log embed
      const embed = new EmbedBuilder()
        .setColor(action === 'Left' ? 'Orange' : action === 'Kicked' ? 'Yellow' : 'Red')
        .setTitle(`📤 Member ${action}`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: 'Username', value: member.user.tag, inline: true },
          { name: 'Nickname', value: member.nickname || 'None', inline: true },
          { name: 'User ID', value: member.id, inline: true },
          { name: 'Joined At', value: joinTime ? joinTime.toLocaleString() : 'Unknown', inline: true },
          { name: 'Left At', value: leaveTime.toLocaleString(), inline: true },
          { name: 'Time in Server', value: timeInServer || 'Unknown', inline: true },
          { name: 'Remaining Members', value: `${member.guild.memberCount}`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

      // Update member count channel
      if (memberCountChannelInstance) {
        const newChannelName = `👥︱Total Members: ${member.guild.memberCount}`;
        if (memberCountChannelInstance.name !== newChannelName) {
          await memberCountChannelInstance.setName(newChannelName);
        }
      }
    } catch (error) {
      console.error('Error handling guildMemberRemove:', error);
    }
  },
};

// Utility function for duration formatting
function formatDuration(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${remainingSeconds}s`;

  return result.trim();
}
