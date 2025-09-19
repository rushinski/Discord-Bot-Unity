/**
 * Slash Command: /id-unban
 * ----------------------------------------
 * Unbans a user from the server by their Discord ID.
 *
 * Example:
 *   /id-unban userid:123456789012345678
 *
 * Notes:
 * - Requires the "Ban Members" permission.
 * - Only works if the user is currently banned from the server.
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('id-unban')
    .setDescription('Unban a user by their Discord ID.')
    .addStringOption(option =>
      option
        .setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');

    try {
      // ✅ Ensure the bot has permission
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: '⚠️ I do not have permission to unban members in this server.',
          flags: 64, // ephemeral
        });
      }

      // ✅ Attempt unban
      await interaction.guild.bans.remove(userId);

      return interaction.reply({
        content: `✅ Successfully unbanned user with ID **${userId}**.`,
      });
    } catch (error) {
      console.error('❌ Error in /id-unban command:', error);
      return interaction.reply({
        content: `❌ Failed to unban user with ID **${userId}**. They may not have been banned, or I lack the required permissions.`,
        flags: 64, // ephemeral
      });
    }
  },
};
