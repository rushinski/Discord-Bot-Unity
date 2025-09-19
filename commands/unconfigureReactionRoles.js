const { SlashCommandBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('unconfigure-reaction-roles')
    .setDescription('Remove a reaction role category configuration.')
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
    await interaction.deferReply({ ephemeral: true });

    try {
      const category = interaction.options.getString('category');
      const deleteMessage = interaction.options.getBoolean('delete-message') || false;

      const config = await RoleReactionMessage.findOneAndDelete({
        guildId: interaction.guild.id,
        messageType: category,
      });

      if (!config) {
        await interaction.editReply(
          `⚠️ No reaction role configuration found for category: **${category}**.`
        );
        return;
      }

      // Optionally delete the associated message
      if (deleteMessage && config.messageId && config.channelId) {
        try {
          const channel = await interaction.guild.channels.fetch(config.channelId);
          if (channel) {
            const msg = await channel.messages.fetch(config.messageId).catch(() => null);
            if (msg) await msg.delete();
          }
        } catch (err) {
          console.warn(`⚠️ Failed to delete message for category ${category}:`, err.message);
        }
      }

      await interaction.editReply(
        `✅ Reaction role configuration removed for category: **${category}**.${deleteMessage ? ' Message deleted.' : ''}`
      );
    } catch (error) {
      console.error('❌ Error unconfiguring reaction roles:', error);
      await interaction.editReply('❌ Failed to unconfigure reaction roles. Please try again later.');
    }
  },
};
