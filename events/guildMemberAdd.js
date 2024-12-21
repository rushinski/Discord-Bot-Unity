const { Events, EmbedBuilder } = require('discord.js');
const Config = require('../schemas/config'); // Import the MongoDB schema for config

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    if (!member.guild) return console.log('Guild is undefined');

    // Fetch the configuration from MongoDB
    const configData = await Config.findOne({ guildId: member.guild.id });
    if (!configData) {
      return console.log('Configuration not found for the guild');
    }

    const { welcomeChannel, joinLeaveLogChannel, memberCountChannel } = configData;

    if (!welcomeChannel || !joinLeaveLogChannel || !memberCountChannel) {
      return console.log('One or more channel IDs are missing in the configuration');
    }

    const welcomeChannelInstance = member.guild.channels.cache.get(welcomeChannel);
    const joinLeaveLogChannelInstance = member.guild.channels.cache.get(joinLeaveLogChannel);
    const memberCountChannelInstance = member.guild.channels.cache.get(memberCountChannel);

    if (!welcomeChannelInstance) {
      console.log('Welcome channel not found');
    }

    if (!joinLeaveLogChannelInstance) {
      console.log('Join leave log channel not found');
    }

    if (!memberCountChannelInstance) {
      console.log('Member count channel not found');
    }

    // Calculate account age
    const accountCreatedAt = member.user.createdAt;
    const joinedAt = new Date();
    const accountAge = calculateDuration(accountCreatedAt, joinedAt);

    // Embed for the welcome channel
    const welcomeEmbed = new EmbedBuilder()
      .setColor('Green')
      .setTitle(`Welcome to THE ORDER OF THE CRIMSON MOON‼️`)
      .setDescription(
        `Hey **${member.user.username}**, we're glad to have you here! To get started:\n` +
        `- First check out <#1245565013457113138> for the server's rules and info.\n` +
        `- After that visit <#1245564997128683571> to verify yourself and gain access to the rest of the server.\n\n` +
        `Thank you for helping to make our community bigger, we now have **${member.guild.memberCount}** members!\n` +
        `*mention* <@${member.id}>`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Embed for the leave log channel
    const leaveLogEmbed = new EmbedBuilder()
      .setColor('Green')
      .setTitle(`Member Joined the Server`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFields(
        { name: 'Username', value: member.user.tag, inline: true },
        { name: 'Nickname', value: member.nickname || 'No nickname', inline: true },
        { name: 'User ID', value: member.id, inline: true },
        { name: 'Account Created', value: accountCreatedAt.toLocaleString(), inline: true },
        { name: 'Account Age', value: accountAge, inline: true },
        { name: 'Joined At', value: joinedAt.toLocaleString(), inline: true },
        { name: 'Current Member Count', value: `${member.guild.memberCount} members`, inline: true }
      )
      .setFooter({ text: 'Welcome to the server!', iconURL: member.guild.iconURL({ dynamic: true }) || undefined })
      .setTimestamp();

    // Send the welcome embed
    if (welcomeChannelInstance) {
      try {
        await welcomeChannelInstance.send({ embeds: [welcomeEmbed] });
        console.log('Welcome message sent successfully');
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    }

    // Send the leave log embed
    if (joinLeaveLogChannelInstance) {
      try {
        await joinLeaveLogChannelInstance.send({ embeds: [leaveLogEmbed] });
        console.log('Welcome message sent to join leave log channel successfully');
      } catch (error) {
        console.error('Failed to send welcome message to join leave log channel:', error);
      }
    }

    if (memberCountChannel) { 
      const memberCountChannelInstance = member.guild.channels.cache.get(memberCountChannel); // Fetch channel by ID
      if (memberCountChannelInstance) {
        try {
          // Construct the new channel name
          const newChannelName = `👥︱ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀs : ${member.guild.memberCount}`;
    
          // Check if the current name is already correct to avoid unnecessary updates
          if (memberCountChannelInstance.name !== newChannelName) {
            await memberCountChannelInstance.setName(newChannelName);
            console.log('Member count updated successfully');
          } else {
            console.log('Member count channel name is already up-to-date.');
          }
        } catch (error) {
          console.error('Failed to update member count:', error);
        }
      } else {
        console.log('Member count channel not found in the guild.');
      }
    } else {
      console.log('Member count channel ID not set in the database.');
    }
  }
};

// Utility function to calculate duration between two dates
function calculateDuration(startDate, endDate) {
  const milliseconds = endDate - startDate;
  const seconds = Math.floor(milliseconds / 1000);
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
