const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    // Replace with the channel ID where the message should be sent
    const channelId = '1303946510010028083';
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) return console.log("Channel not found!");

    const joinTime = member.joinedAt;
    const leaveTime = new Date(); // Current time (when the member left)
    const timeInServer = Math.floor((leaveTime - joinTime) / 1000); // Time spent in the server in seconds

    const formattedJoinTime = joinTime.toLocaleString();
    const formattedLeaveTime = leaveTime.toLocaleString();
    const memberCount = member.guild.memberCount; // Get the current member count

    // Create the embed with the user details
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('Member Left the Server')
      .addFields(
        { name: 'Username', value: member.user.username },
        { name: 'Account ID', value: member.id },
        { name: 'Joined at', value: formattedJoinTime },
        { name: 'Left at', value: formattedLeaveTime },
        { name: 'Time in Server', value: `${timeInServer} seconds` },
        { name: 'Current Member Count', value: `${memberCount} members` }
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });  // Make sure footer is correctly set here

    try {
      // Send the embed message to the specified channel
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending message to channel:', error);
    }
  }
};
