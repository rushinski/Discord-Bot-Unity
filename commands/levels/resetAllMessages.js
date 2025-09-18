/**
 * Slash Command: /reset-all-messages
 * ----------------------------------------
 * Allows administrators to reset the message counts
 * and levels of all users in the server back to zero.
 *
 * Notes:
 * - Only users with the "Manage Server" permission
 *   can execute this command.
 * - This action affects ALL users in the database.
 * - Uses bulk update for efficiency and avoids timeouts
 *   by deferring the reply.
 */

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('reset-all-messages')
    .setDescription('Reset the levels and message counts of all users.'),

  async execute(interaction) {
    try {
      // Ensure the user has the proper permission
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({
          content: '⚠️ You do not have permission to use this command.',
          flags: 64,
        });
      }

      // Defer the reply to avoid the 3-second timeout
      await interaction.deferReply({ flags: 64 });

      // Perform a bulk update: reset messages and levels for all users
      const result = await User.updateMany(
        {},
        { messages: 0, level: levels[0].level }
      );

      // If no users were updated, notify the admin
      if (result.modifiedCount === 0) {
        return interaction.editReply({
          content: 'ℹ️ There were no users to reset in the database.',
        });
      }

      // Confirm the reset was successful
      return interaction.editReply({
        content: `✅ Successfully reset levels and message counts for **${result.modifiedCount} users**.`,
      });
    } catch (error) {
      // Log the error for debugging
      console.error('Error in /reset-all-messages command:', error);

      // Return a safe, private error message
      return interaction.editReply({
        content: '❌ An error occurred while resetting user levels. Please try again later.',
      });
    }
  },
};
