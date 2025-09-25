/**
 * Command: /enable-levelup
 * Purpose: Allow users to enable direct notifications when their level changes.
 *
 * Responsibilities:
 * - Retrieve or create the requesting user’s record in the database.
 * - Update the user’s preferences to enable notifications.
 * - Persist changes to the database.
 * - Confirm the update with a private (ephemeral) response.
 *
 * Notes for Recruiters:
 * This command complements /disable-levelup by giving users
 * full control over whether they receive level change notifications.
 * It demonstrates clean persistence of user preferences.
 */

const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enable-levelup')
    .setDescription('Enable your level-up notifications.'),

  /**
   * Execution handler for /enable-levelup.
   * @param {import('discord.js').CommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Retrieve or create user record
      let user = await User.findOne({ userId });

      if (!user) {
        user = new User({
          userId,
          messages: 0,
          notificationsEnabled: true,
        });
      } else {
        user.notificationsEnabled = true;
      }

      await user.save();

      return interaction.reply({
        content: 'Your level-up notifications have been enabled. Use `/disable-levelup` to turn them off.',
        flags: 64,
      });
    } catch (err) {
      console.error('[enable-levelup] Command execution failed:', err);

      return interaction.reply({
        content: 'An error occurred while updating your settings. Please try again later.',
        flags: 64,
      });
    }
  },
};
