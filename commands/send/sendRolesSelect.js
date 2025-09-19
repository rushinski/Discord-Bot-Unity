/**
 * Command: /send-role-select
 * --------------------------
 * Sends configured reaction-role embeds for this guild.
 * Old messages are cleaned up before new embeds are posted,
 * and configuration is updated with the new message IDs.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/RoleReactionMessage');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('send-role-select')
    .setDescription('Sends the configured reaction-role embeds.'),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const configs = await RoleReactionMessage.find({ guildId: interaction.guild.id });

      if (!configs.length) {
        await interaction.editReply({
          content: '⚠️ No role configurations found. Use `/configure-reaction-roles` first.',
          flags: 64,
        });
        return;
      }

      for (const config of configs) {
        // 🧹 Clean up old message if it exists
        if (config.messageId) {
          try {
            const channel = await interaction.guild.channels.fetch(config.channelId);
            if (channel) {
              const oldMessage = await channel.messages.fetch(config.messageId).catch(() => null);
              if (oldMessage) await oldMessage.delete();
            }
          } catch (err) {
            console.warn(`[RoleSystem] Failed to clean old message for ${config.messageType}:`, err.message);
          }
        }

        // 📦 Build embed dynamically
        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle(`Select your ${config.messageType}`)
          .setDescription(
            `${config.description}\n\n${config.roles
              .map(r => `${r.emoji}︱**${r.roleName}**`)
              .join('\n')}`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp();

        // ✉️ Send new embed
        const message = await interaction.channel.send({ embeds: [embed] });

        // 💾 Save updated message details
        config.messageId = message.id;
        config.channelId = interaction.channel.id;
        await config.save();

        // ➕ Add role reactions
        for (const r of config.roles) {
          try {
            await message.react(r.emoji);
          } catch (err) {
            console.error(`[RoleSystem] Failed to react with ${r.emoji}:`, err.message);
          }
        }
      }

      await interaction.editReply({
        content: '✅ Reaction-role embeds have been sent!',
        flags: 64,
      });
    } catch (error) {
      console.error('[RoleSystem] Error sending role select embeds:', error);

      await interaction.editReply({
        content: '❌ Failed to send role selection embeds.',
        flags: 64,
      });
    }
  },
};
