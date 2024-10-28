const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    // Ensure the guild and channels are accessible
    if (!member.guild) {
      console.log('Guild is undefined');
      return;
    }

    const welcomeChannelId = '1245565011942834226';
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    // Check if the channel is available
    if (!channel) {
      console.log('Welcome channel not found');
      return;
    }

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Welcome to THE ORDER OF THE CRIMSON MOON Rok Jumping Group!')
      .setDescription(
        `Hey ${member}, we're glad to have you here! To get started:\n` +
        `- First check out <#1245565013457113138> for the server's rules and info.\n` +
        `- After that visit <#1245564997128683571> to verify yourself and gain access to the rest of the server.\n\n` +
        `Thank you for helping to make our community bigger, we now have **${member.guild.memberCount}** members!`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the welcome message
    try {
      await channel.send({ embeds: [welcomeEmbed] });
      console.log('Welcome message sent successfully');
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  }
};
