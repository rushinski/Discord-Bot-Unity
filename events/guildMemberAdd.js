const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    if (!member.guild) return console.log('Guild is undefined');

    const welcomeChannelId = '1245565011942834226';
    const memberCountChannelId = '1300291093186744412'; // Replace with your member count channel ID
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) return console.log('Welcome channel not found');

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

    // Send the welcome message
    try {
      await channel.send({ embeds: [welcomeEmbed] });
      console.log('Welcome message sent successfully');
    } catch (error) {
      console.error('Failed to send welcome message:', error);
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
