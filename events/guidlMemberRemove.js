const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const MessageLogChannel = require('../schemas/config'); // Import schema for config

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    // Get the leave log channel ID from the database
    const logChannelData = await MessageLogChannel.findOne({ guildId: member.guild.id });
    if (!logChannelData || !logChannelData.leaveLogChannel) return;

    const leaveLogChannelId = logChannelData.leaveLogChannel;
    const channel = member.guild.channels.cache.get(leaveLogChannelId);
    if (!channel) return console.log("Leave log channel not found!");

    const joinTime = member.joinedAt;
    const leaveTime = new Date();
    const timeInServer = Math.floor((leaveTime - joinTime) / 1000);
    const formattedTimeInServer = formatDuration(timeInServer);

    // Check if the member was banned or kicked
    let action = 'Left';
    try {
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      });
      const banLog = fetchedLogs.entries.first();

      if (banLog && banLog.target.id === member.id) {
        action = 'Banned';
      } else {
        // Check for kick
        const fetchedKickLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberKick,
        });
        const kickLog = fetchedKickLogs.entries.first();

        if (kickLog && kickLog.target.id === member.id) {
          action = 'Kicked';
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
    let guild = member.guild;

    // Create the embed for the member leaving
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle(`Member ${action} the Server`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFields(
        { name: 'Username', value: member.user.tag, inline: true },
        { name: 'Nickname', value: member.nickname || 'No nickname', inline: true },
        { name: 'Account ID', value: member.id, inline: true },
        { name: 'Joined At', value: joinTime ? joinTime.toLocaleString() : 'Unknown', inline: true },
        { name: 'Left At', value: leaveTime.toLocaleString(), inline: true },
        { name: 'Time in Server', value: formattedTimeInServer || 'Unknown', inline: true },
        { name: 'Current Member Count', value: `${guild.memberCount} members`, inline: true }
      )
      .setFooter({ text: 'Member left', iconURL: guild.iconURL({ dynamic: true }) || undefined })
      .setTimestamp();

    // Send the embed to the log channel
    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending message to channel:', error);
    }

    // Update the member count channel
    const memberCountChannelId = '1300291093186744412'; // Replace with your member count channel ID
    try {
      const memberCountChannel = member.guild.channels.cache.get(memberCountChannelId);
      if (memberCountChannel) {
        await memberCountChannel.setName(`👥︱ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀs : ${member.guild.memberCount}`);
        console.log('Member count updated successfully');
      } else {
        console.log('Member count channel not found');
      }
    } catch (error) {
      console.error('Failed to update member count:', error);
    }
  }
};

// Utility function to format duration into days, hours, minutes, and seconds
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
