/**
 * Command: /id-ban
 *
 * Purpose:
 * Allow administrators to ban a user from the server by their Discord ID,
 * regardless of whether the user is currently in the server.
 *
 * Responsibilities:
 * - Verify that the invoking user and the bot both have "Ban Members" permission.
 * - Accept a user ID and optional reason as inputs.
 * - Attempt to ban the specified user by ID.
 * - Provide clear confirmation or error feedback to the administrator.
 *
 * Recruiter Notes:
 * This command is an example of administrative tooling for moderation.
 * It highlights permission enforcement, safe error handling, and the
 * ability to moderate users who are not currently active in the server.
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
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the ban (optional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Ensure the bot has the required permission.
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: 'The bot does not have permission to ban members in this server.',
          flags: 64, // Ephemeral reply
        });
      }

      // Attempt to ban the user by ID.
      await interaction.guild.members.ban(userId, { reason });

      return interaction.reply({
        content: `User with ID ${userId} was banned successfully.\nReason: ${reason}`,
      });
    } catch (error) {
      console.error('[Moderation:id-ban] Error executing command:', error);

      return interaction.reply({
        content: `The bot was unable to ban the user with ID ${userId}. They may not exist, or the bot may lack the required permissions.`,
        flags: 64, // Ephemeral reply
      });
    }
  },
};
