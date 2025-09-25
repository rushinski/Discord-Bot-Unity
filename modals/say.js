/**
 * File: say.js
 * Modal Handler: Say
 *
 * Purpose:
 * Handle user submissions from the /say command modal. This allows
 * administrators to provide a message for the bot to repeat in the channel.
 *
 * Responsibilities:
 * - Retrieve the text input from the modal submission.
 * - Block unsafe content such as mass mentions (@everyone, @here, or roles).
 * - Provide ephemeral confirmation to the user.
 * - Attempt to send the provided message to the channel, with error handling.
 *
 * Recruiter Notes:
 * This file demonstrates responsible handling of user-generated input:
 * security safeguards are applied, errors are gracefully managed,
 * and consistent confirmation is provided to the user.
 */

module.exports = {
  // This identifier links the modal submission back to the /say command.
  customID: 'say',

  /**
   * Execute the modal handler.
   * @param {object} interaction - The modal submission interaction from Discord.
   */
  async execute(interaction) {
    // Retrieve the text entered by the user in the "message" input field.
    const message = interaction.fields.getTextInputValue('message');

    // Prevent abuse: block messages containing mass mentions
    // such as @everyone, @here, or role mentions (<@&roleId>).
    if (/@everyone|@here|<@&\d+>/.test(message)) {
      return interaction.reply({
        content: 'Mass mentions (everyone, here, or role mentions) are not allowed.',
        flags: 64, // Ephemeral: only the user who submitted sees this response.
      });
    }

    // Defer reply immediately so the user gets confirmation that the submission was received.
    // This prevents Discord from timing out while the bot processes the request.
    await interaction.deferReply({ flags: 64 });

    try {
      // Attempt to send the message into the same channel where the command was triggered.
      await interaction.channel.send(message);

      // Update the deferred ephemeral reply to confirm success.
      await interaction.editReply('Your message was sent successfully.');
    } catch (error) {
      // Log the error for debugging and audit purposes.
      console.error('[Modal:say] Failed to send message:', error);

      // Update the deferred reply with a professional error notice.
      await interaction.editReply(
        'The message could not be sent. Please ensure the bot has permission to post in this channel.'
      );
    }
  },
};
