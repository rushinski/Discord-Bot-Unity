/**
 * File: unconfigureReactionRoles.js
 * Purpose: Slash command to remove a reaction-role category configuration.
 *
 * Responsibilities:
 * - Allow administrators to remove a previously configured reaction-role category.
 * - Optionally delete the associated role-selection message from the channel.
 * - Ensure changes are reflected in the database.
 *
 * Notes for Recruiters:
 * Reaction roles let users assign themselves roles via emoji selections.
 * This command removes a category of reaction roles, and optionally deletes
 * the corresponding interactive message from the server.
 */

const { SlashCommandBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/roleReactionMessage');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('unconfigure-reaction-roles')
    .setDescription('Remove a reaction-role category configuration.')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('The category name to remove (e.g., continent, spender, troop)')
        .setRequired(true),
    )
    .addBooleanOption(option =>
      option
        .setName('delete-message')
        .setDescription('If true, delete the associated role selection message.')
        .setRequired(false),
    ),

  /**
   * Execute the unconfigure-reaction-roles command.
   * @param {object} interaction - The Discord interaction instance.
   */
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
          content: `No reaction-role configuration found for category: **${category}**.`,
          flags: 64,
        });
        return;
      }

      // Optionally delete the associated message
      if (deleteMessage && config.messageId && config.channelId) {
        try {
          const channel = await interaction.guild.channels.fetch(config.channelId);
          if (channel) {
            const msg = await channel.messages.fetch(config.messageId).catch(() => null);
            if (msg) {
              await msg.delete();
              console.log(`[UnconfigureReactionRoles] Deleted reaction-role message for category ${category} in guild ${interaction.guild.id}`);
            }
          }
        } catch (err) {
          console.warn(`[UnconfigureReactionRoles] Failed to delete message for category ${category} in guild ${interaction.guild.id}:`, err.message);
        }
      }

      await interaction.editReply({
        content: `Reaction-role configuration removed for category: **${category}**.${deleteMessage ? ' Associated message deleted.' : ''}`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[UnconfigureReactionRoles] Error while removing reaction-role config in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: 'An unexpected error occurred while unconfiguring reaction roles. Please try again later.',
        flags: 64,
      });
    }
  },
};
