/**
 * File: guildMemberRemove.js
 * Purpose: Handles member departures and ensures accurate logging.
 *
 * Responsibilities:
 * - Detect when a member leaves, is kicked, or is banned.
 * - Log the departure in the join/leave log channel with relevant details.
 * - Update the member count channel to reflect the change.
 *
 * Notes for Recruiters:
 * This module ensures that all member departures are tracked with
 * clear context. It supports moderation transparency by distinguishing
 * voluntary leaves from administrative actions (kicks/bans).
 */

const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const Config = require('../schemas/config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    if (!member.guild) return;

    try {
      // Retrieve guild-specific configuration
      const configData = await Config.findOne({ guildId: member.guild.id });
      if (!configData) return;

      const { joinLeaveLogChannel, memberCountChannel } = configData;
      const logChannel = member.guild.channels.cache.get(joinLeaveLogChannel);
      const memberCountChannelInstance = member.guild.channels.cache.get(memberCountChannel);

      if (!logChannel) return;

      const joinTime = member.joinedAt;
      const leaveTime = new Date();
      const timeInServer = formatDuration(Math.floor((leaveTime - joinTime) / 1000));

      // Default action is voluntary leave
      let action = 'Left';

      // Attempt to determine if the user was kicked or banned
      try {
        const kickLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
        const kickLog = kickLogs.entries.first();
        if (kickLog && kickLog.target.id === member.id && (Date.now() - kickLog.createdTimestamp) < 5000) {
          action = 'Kicked';
        } else {
          const banLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
          const banLog = banLogs.entries.first();
          if (banLog && banLog.target.id === member.id && (Date.now() - banLog.createdTimestamp) < 5000) {
            action = 'Banned';
          }
        }
      } catch (auditError) {
        console.error('[guildMemberRemove] Error retrieving audit logs:', auditError);
      }

      // Departure log embed
      const embed = new EmbedBuilder()
        .setColor(action === 'Left' ? 'Orange' : action === 'Kicked' ? 'Yellow' : 'Red')
        .setTitle(`Member ${action}`)
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
        const newChannelName = `Total Members: ${member.guild.memberCount}`;
        if (memberCountChannelInstance.name !== newChannelName) {
          await memberCountChannelInstance.setName(newChannelName);
        }
      }
    } catch (error) {
      console.error('[guildMemberRemove] Error processing member departure:', error);
    }
  },
};

/**
 * Utility: formatDuration
 * Returns a human-readable string for a duration given in seconds.
 */
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
