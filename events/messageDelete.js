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

    // Create an embed for the deleted message
    const embed = new EmbedBuilder()
      .setTitle('Message Deleted')
      .setColor('Red')
      .addFields(
        { name: 'Author', value: `${message.author.tag} (<@${message.author.id}>)` },
        { name: 'Message', value: message.content || 'No content' },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true }
      )
      .setTimestamp(new Date())
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the embed to the log channel
    logChannel.send({ embeds: [embed] }).catch(console.error);
  },
};
