/**
 * Slash Command: /enable-levelup
 * ----------------------------------------
 * Allows a user to enable their level-up
 * notification messages.
 *
 * Users can disable notifications using
 * the `/disable-levelup` command.
 */

const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enable-levelup')
    .setDescription('Enable your level-up notifications.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Look up the user record in the database
      let user = await User.findOne({ userId });

      // If no record exists, create one with notifications enabled
      if (!user) {
        user = new User({
          userId,
          messages: 0,
          notificationsEnabled: true,
        });
      } else {
        // Update the setting on the existing user record
        user.notificationsEnabled = true;
      }

      // Persist changes
      await user.save();

      // Confirm success to the user (ephemeral)
      await interaction.reply({
        content: '✅ Your level-up notifications have been enabled.',
        flags: 64,
      });
    } catch (err) {
      // Log error for debugging but keep user-facing message professional
      console.error('Error enabling level-up notifications:', err);

      await interaction.reply({
        content: '⚠️ An error occurred while updating your settings. Please try again later.',
        flags: 64,
      });
    }
  },
};
