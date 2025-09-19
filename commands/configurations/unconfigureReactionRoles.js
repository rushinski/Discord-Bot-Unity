/**
 * Command: /unconfigure-reaction-roles
 * ------------------------------------
 * Removes a reaction-role category configuration for the guild.
 * Optionally deletes the associated role selection message.
 *
 * Example usage:
 * /unconfigure-reaction-roles
 *   category: continent
 *   delete-message: true
 */

const { SlashCommandBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/RoleReactionMessage');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('unconfigure-reaction-roles')
    .setDescription('Remove a reaction-role category configuration.')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('The category name to remove (e.g., continent, spender, troop)')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('delete-message')
        .setDescription('If true, delete the associated role message from the channel.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const category = interaction.options.getString('category').trim();
      const deleteMessage = interaction.options.getBoolean('delete-message') || false;

      const config = await RoleReactionMessage.findOneAndDelete({
        guildId: interaction.guild.id,
        messageType: category,
      });

      if (!config) {
        await interaction.editReply({
          content: `⚠️ No reaction-role configuration found for category: **${category}**.`,
          flags: 64,
        });
        return;
      }

      // 🧹 Optionally delete the associated message
      if (deleteMessage && config.messageId && config.channelId) {
        try {
          const channel = await interaction.guild.channels.fetch(config.channelId);
          if (channel) {
            const msg = await channel.messages.fetch(config.messageId).catch(() => null);
            if (msg) {
              await msg.delete();
              console.log(`[RoleSystem] Deleted old reaction-role message for category ${category} in guild ${interaction.guild.id}`);
            }
          }
        } catch (err) {
          console.warn(`[RoleSystem] Failed to delete message for category ${category} in guild ${interaction.guild.id}:`, err.message);
        }
      }

      await interaction.editReply({
        content: `✅ Reaction-role configuration removed for category: **${category}**.${deleteMessage ? ' Message deleted.' : ''}`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[RoleSystem] Error unconfiguring reaction roles in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: '❌ Failed to unconfigure reaction roles. Please try again later.',
        flags: 64,
      });
    }
  },
};
