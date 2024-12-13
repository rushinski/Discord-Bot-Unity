const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config'); // Use the unified schema

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // Ensure this runs when a message is edited
    if (oldMessage.content === newMessage.content || oldMessage.author.bot) {
      return; // No content change or message from a bot, skip
    }

    // Fetch guild configuration
    const guildConfig = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
    if (!guildConfig || !guildConfig.moderationLogChannel) return;

    // Get the log channel using the stored ID
    const logChannel = oldMessage.guild.channels.cache.get(guildConfig.moderationLogChannel);
    if (!logChannel) return;

    // Create an embed for the edited message
    const embed = new EmbedBuilder()
      .setTitle('Message Edited')
      .setColor('Yellow')
      .addFields(
        { name: 'Author', value: `${oldMessage.author.tag} (<@${oldMessage.author.id}>)` },
        { name: 'Old Message', value: oldMessage.content || 'No content' },
        { name: 'New Message', value: newMessage.content || 'No content' },
        { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true }
      )
      .setTimestamp(new Date())
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the embed to the log channel
    logChannel.send({ embeds: [embed] }).catch(console.error);
  },
};
