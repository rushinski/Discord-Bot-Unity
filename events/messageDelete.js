const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/config'); // Use the unified schema

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    // Ensure this runs for deletable messages and exclude bot messages
    if (!message.guild || !message.author || message.author.bot) return;

    // Fetch guild configuration
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!guildConfig || !guildConfig.moderationLogChannel) return;

    // Get the log channel using the stored ID
    const logChannel = message.guild.channels.cache.get(guildConfig.moderationLogChannel);
    if (!logChannel) return;

    // Handle missing or empty content gracefully
    const messageContent = message.content?.trim() || 'No content';
    const MAX_FIELD_LENGTH = 1024;
    const truncate = (content) =>
      content.length > MAX_FIELD_LENGTH ? content.slice(0, MAX_FIELD_LENGTH - 3) + '...' : content;

    // Fetch user details
    const user = message.author;
    const nickname = message.member?.nickname || 'No nickname';
    const userId = user.id;
    const username = user.tag;

    // Create an embed for the deleted message
    const embed = new EmbedBuilder()
      .setTitle('Message Deleted')
      .setColor('Red')
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'Author', value: username, inline: true },
        { name: 'Nickname', value: nickname, inline: true },
        { name: 'User ID', value: userId, inline: true },
        {
          name: 'Message Time (UTC)',
          value: message.createdAt?.toISOString() || 'Unknown',
          inline: true,
        },
        {
          name: 'Deleted At (UTC)',
          value: new Date().toISOString(),
          inline: true,
        },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: false },
        { name: 'Message Content', value: truncate(messageContent), inline: false },
      )
      .setTimestamp(new Date())
      .setFooter({
        text: 'Message moderation logs',
        iconURL: message.guild.iconURL({ dynamic: true }) || undefined,
      });

    // Send the embed to the log channel
    try {
      await logChannel.send({ embeds: [embed] });
      console.log('Deleted message log sent successfully.');
    } catch (error) {
      console.error('Failed to send deleted message log:', error);
    }
  },
};
