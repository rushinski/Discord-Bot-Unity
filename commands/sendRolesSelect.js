const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-role-select')
    .setDescription('Sends the configured reaction role embeds.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Pull all configured role sets for this guild
      const configs = await RoleReactionMessage.find({ guildId: interaction.guild.id });

      if (!configs.length) {
        await interaction.editReply('⚠️ No role configurations found. Use /configure-reaction-roles first.');
        return;
      }

      for (const config of configs) {
        // If an old message exists, try to delete it
        if (config.messageId) {
          try {
            const channel = await interaction.guild.channels.fetch(config.channelId);
            if (channel) {
              const oldMessage = await channel.messages.fetch(config.messageId).catch(() => null);
              if (oldMessage) await oldMessage.delete();
            }
          } catch (err) {
            console.warn(`⚠️ Could not clean up old message for ${config.messageType}:`, err.message);
          }
        }

        // Build embed dynamically
        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle(`Select your ${config.messageType}`)
          .setDescription(
            `${config.description}\n\n` +
            config.roles.map(r => `${r.emoji}︱**${r.roleName}**`).join('\n')
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp();

        // Send new embed
        const message = await interaction.channel.send({ embeds: [embed] });

        // Save message details to DB
        config.messageId = message.id;
        config.channelId = interaction.channel.id;
        await config.save();

        // Add reactions
        for (const r of config.roles) {
          try {
            await message.react(r.emoji);
          } catch (err) {
            console.error(`Failed to react with ${r.emoji}:`, err.message);
          }
        }
      }

      await interaction.editReply('✅ Reaction role embeds have been sent!');
    } catch (error) {
      console.error('Error sending role select embeds:', error);
      await interaction.editReply('❌ Failed to send role selection embeds.');
    }
  },
};
