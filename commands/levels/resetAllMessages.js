/**
 * Command: /reset-all-messages
 * Purpose: Reset the message counts and levels of all users in the database.
 *
 * Responsibilities:
 * - Validate that the executing user has sufficient permissions.
 * - Perform a bulk reset of message counts and levels across all users.
 * - Defer interaction replies to prevent timeouts during execution.
 * - Confirm the reset result to the administrator.
 *
 * Notes for Recruiters:
 * This command demonstrates bulk administrative operations.
 * It shows how the system can efficiently reset state for all users
 * while maintaining controlled execution and auditability.
 */

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('reset-all-messages')
    .setDescription('Reset all users’ levels and message counts to defaults.'),

  /**
   * Execution handler for /reset-all-messages.
   * @param {import('discord.js').CommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    try {
      // Verify administrator permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({
          content: 'You do not have permission to use this command.',
          flags: 64,
        });
      }

      // Defer reply to prevent Discord 3-second timeout
      await interaction.deferReply({ flags: 64 });

      // Bulk reset: set all users' messages to 0 and levels to default
      const result = await User.updateMany(
        {},
        { messages: 0, level: levels[0].level }
      );

      // Handle case where no users exist
      if (result.modifiedCount === 0) {
        return interaction.editReply({
          content: 'No users were found in the database to reset.',
        });
      }

      // Confirm successful reset
      return interaction.editReply({
        content: `Successfully reset levels and message counts for **${result.modifiedCount} users**.`,
      });
    } catch (error) {
      console.error('[reset-all-messages] Command execution failed:', error);

      return interaction.editReply({
        content: 'An error occurred while resetting user levels. Please try again later.',
      });
    }
  },
};
