/**
 * File: guildMemberAdd.js
 * Purpose: Handles new member joins and maintains accurate server state.
 *
 * Responsibilities:
 * - Send a structured welcome message to the configured welcome channel.
 * - Log join events in the join/leave log channel with user account details.
 * - Update the member count channel when a new member joins.
 *
 * Notes for Recruiters:
 * This module ensures that new members are acknowledged and that
 * the server maintains accurate join records for moderation and
 * community management purposes.
 */

const { Events, EmbedBuilder } = require('discord.js');
const Config = require('../schemas/config');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    if (!member.guild) return;

    try {
      // Retrieve guild-specific configuration
      const configData = await Config.findOne({ guildId: member.guild.id });
      if (!configData) return;

      const { welcomeChannel, joinLeaveLogChannel, memberCountChannel } = configData;

      const welcomeChannelInstance = member.guild.channels.cache.get(welcomeChannel);
      const joinLeaveLogChannelInstance = member.guild.channels.cache.get(joinLeaveLogChannel);
      const memberCountChannelInstance = member.guild.channels.cache.get(memberCountChannel);

      // Calculate account age for context
      const accountCreatedAt = member.user.createdAt;
      const joinedAt = new Date();
      const accountAge = calculateDuration(accountCreatedAt, joinedAt);

      // Welcome message embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Welcome')
        .setDescription(
          `Hello **${member.user.username}**, welcome to **${member.guild.name}**.\n\n` +
          `You are member #${member.guild.memberCount}.`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setTimestamp();

      // Detailed join log embed
      const logEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Member Joined')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: 'Username', value: member.user.tag, inline: true },
          { name: 'Nickname', value: member.nickname || 'None', inline: true },
          { name: 'User ID', value: member.id, inline: true },
          { name: 'Account Created', value: accountCreatedAt.toLocaleString(), inline: true },
          { name: 'Account Age', value: accountAge, inline: true },
          { name: 'Joined At', value: joinedAt.toLocaleString(), inline: true },
          { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
        )
        .setTimestamp();

      // Send notifications
      if (welcomeChannelInstance) await welcomeChannelInstance.send({ embeds: [welcomeEmbed] });
      if (joinLeaveLogChannelInstance) await joinLeaveLogChannelInstance.send({ embeds: [logEmbed] });

      // Update member count channel
      if (memberCountChannelInstance) {
        const newChannelName = `Total Members: ${member.guild.memberCount}`;
        if (memberCountChannelInstance.name !== newChannelName) {
          await memberCountChannelInstance.setName(newChannelName);
        }
      }
    } catch (error) {
      console.error('[guildMemberAdd] Error processing member join:', error);
    }
  },
};

/**
 * Utility: calculateDuration
 * Returns a human-readable duration between two dates.
 */
function calculateDuration(startDate, endDate) {
  const ms = endDate - startDate;
  const seconds = Math.floor(ms / 1000);
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
