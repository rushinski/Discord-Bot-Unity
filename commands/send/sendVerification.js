const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-verification')
    .setDescription('Sends the verification embed'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Make the reply ephemeral

    const guild = interaction.guild;

    try {
      // Check if a verification message already exists
      const existingMessage = await RoleReactionMessage.findOne({
        messageType: 'verification',
        guildId: guild.id,
      });

      // If it exists, delete the old message
      if (existingMessage) {
        const channel = await guild.channels.fetch(existingMessage.channelId);
        if (channel) {
          const oldMessage = await channel.messages.fetch(existingMessage.messageId).catch(() => null);
          if (oldMessage) await oldMessage.delete();
        }
        // Remove the old message from the database
        await RoleReactionMessage.deleteOne({ _id: existingMessage._id });
      }

      // Create and send the new verification message
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('📩 Verification Process')
        .setDescription(
          'Welcome to the server! Please verify your account by reacting with ✅ to this message.\n\n🔍 **What happens next?**\n- A private ticket will be created for you.\n- Our team will interview you briefly.\n- If everything checks out, you’ll be granted full access to the server.\n\nThank you for helping us maintain a secure and welcoming community!'
        )
        .setFooter({
          text: 'Click the check mark below to begin verification.',
          iconURL: guild.iconURL({ dynamic: true }) || undefined, // Handles cases where guild icon isn't available
        })
        .setTimestamp();

      const message = await interaction.channel.send({ embeds: [embed] });

      // Save the new message details in the database
      await RoleReactionMessage.create({
        messageId: message.id,
        messageType: 'verification',
        channelId: interaction.channel.id,
        guildId: guild.id,
      });

      // React to the message
      await message.react('✅');

      await interaction.editReply('Verification message sent successfully!');
    } catch (error) {
      console.error('Error sending verification embed:', error);
      await interaction.editReply('An error occurred while setting up the verification message. Please try again.');
    }
  },
};
