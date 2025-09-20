/**
 * Command: /id-unban
 *
 * Purpose:
 * Allow administrators to unban a user from the server by their Discord ID.
 *
 * Responsibilities:
 * - Verify that the invoking user and the bot both have "Ban Members" permission.
 * - Accept a user ID as input.
 * - Attempt to remove the ban for the specified user ID.
 * - Provide clear confirmation or error feedback to the administrator.
 *
 * Recruiter Notes:
 * This command complements the /id-ban command. It highlights error handling,
 * permission enforcement, and safe reversal of administrative actions.
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
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');

    try {
      // Ensure the bot has the required permission.
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: 'The bot does not have permission to unban members in this server.',
          flags: 64, // Ephemeral reply
        });
      }

      // Attempt to remove the ban for the specified user ID.
      await interaction.guild.bans.remove(userId);

      return interaction.reply({
        content: `User with ID ${userId} was unbanned successfully.`,
      });
    } catch (error) {
      console.error('[Moderation:id-unban] Error executing command:', error);

      return interaction.reply({
        content: `The bot was unable to unban the user with ID ${userId}. They may not currently be banned, or the bot may lack the required permissions.`,
        flags: 64, // Ephemeral reply
      });
    }
  },
};
