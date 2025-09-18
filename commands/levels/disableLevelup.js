/**
 * Slash Command: /disable-levelup
 * ----------------------------------------
 * Allows a user to disable their level-up
 * notification messages.
 *
 * Users can re-enable notifications using
 * the `/enable-levelup` command.
 */

const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disable-levelup')
    .setDescription('Disable your level-up notifications.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Look up the user record in the database
      let user = await User.findOne({ userId });

      // If no record exists, create a new one with notifications disabled
      if (!user) {
        user = new User({
          userId,
          messages: 0,
          notificationsEnabled: false,
        });
      } else {
        // Update the setting on existing user record
        user.notificationsEnabled = false;
      }

      // Persist changes
      await user.save();

      // Confirm success to the user (ephemeral)
      await interaction.reply({
        content: '✅ Your level-up notifications have been disabled. Use `/enable-levelup` to turn them back on.',
        flags: 64,
      });
    } catch (err) {
      // Log error for debugging but keep user-facing message professional
      console.error('Error disabling level-up notifications:', err);

      await interaction.reply({
        content: '⚠️ An error occurred while updating your settings. Please try again later.',
        flags: 64,
      });
    }
  },
};
