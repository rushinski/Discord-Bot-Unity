const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Sends the verification embed'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Make the reply ephemeral

    // Check if a verification message already exists
    const existingMessage = await RoleReactionMessage.findOne({
      messageType: 'verification',
      guildId: interaction.guild.id,
    });

    // If it exists, delete the old message
    if (existingMessage) {
      const channel = await interaction.guild.channels.fetch(existingMessage.channelId);
      if (channel) {
        const oldMessage = await channel.messages.fetch(existingMessage.messageId).catch(() => null);
        if (oldMessage) await oldMessage.delete();
      }

      // Remove from the database
      await RoleReactionMessage.deleteOne({ _id: existingMessage._id });
    }

    // Send the new verification message
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Verification ✅')
      .setDescription('React with ✅ to verify and gain access!')
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const message = await interaction.channel.send({ embeds: [embed] });

    // Save the new verification message to the database
    await RoleReactionMessage.create({
      messageId: message.id,
      messageType: 'verification',
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
    });

    await message.react('✅');
    await interaction.editReply('Verification message sent!'); // Confirmation is ephemeral
  },
};
