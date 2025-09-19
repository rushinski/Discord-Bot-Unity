/**
 * Slash Command: /id-ban
 * ----------------------------------------
 * Bans a user from the server by their Discord ID.
 *
 * Example:
 *   /id-ban userid:123456789012345678 reason:"Spamming"
 *
 * Notes:
 * - Requires the "Ban Members" permission.
 * - Useful for banning users who are not currently in the server.
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('id-ban')
    .setDescription('Ban a user by their Discord ID.')
    .addStringOption(option =>
      option
        .setName('userid')
        .setDescription('The ID of the user to ban')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the ban (optional)')
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // ✅ Ensure the bot has permission to ban
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: '⚠️ I do not have permission to ban members in this server.',
          flags: 64,
        });
      }

      // ✅ Attempt ban by ID
      await interaction.guild.members.ban(userId, { reason });

      return interaction.reply({
        content: `🔨 Successfully banned user with ID **${userId}**.\nReason: ${reason}`,
      });
    } catch (error) {
      console.error('❌ Error in /id-ban command:', error);
      return interaction.reply({
        content: `❌ Failed to ban user with ID **${userId}**. They may not exist, or I lack the required permissions.`,
        flags: 64,
      });
    }
  },
};
