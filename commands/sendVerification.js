const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Sends the verification embed'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Verification ✅')
      .setDescription('React with ✅ to verify and gain access!')
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    await interaction.deferReply({ ephemeral: true });

    const message = await interaction.channel.send({ embeds: [embed] });

    // Save verification message to database
    await RoleReactionMessage.create({
      messageId: message.id,
      messageType: 'verification',
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
    });

    await message.react('✅');
    await interaction.editReply('Verification message sent!');
  },
};
