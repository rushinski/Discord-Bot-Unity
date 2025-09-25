const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const channelId = '1303946510010028083';
    const memberCountChannelId = '1300291093186744412'; // Replace with your member count channel ID
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) return console.log("Channel not found!");

    const joinTime = member.joinedAt;
    const leaveTime = new Date();
    const timeInServer = Math.floor((leaveTime - joinTime) / 1000);

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('Member Left the Server')
      .addFields(
        { name: 'Username', value: member.user.username },
        { name: 'Account ID', value: member.id },
        { name: 'Joined at', value: joinTime.toLocaleString() },
        { name: 'Left at', value: leaveTime.toLocaleString() },
        { name: 'Time in Server', value: `${timeInServer} seconds` },
        { name: 'Current Member Count', value: `${member.guild.memberCount} members` }
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending message to channel:', error);
    }

    // Update member count channel
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
