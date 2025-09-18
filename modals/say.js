/**
 * Modal Handler: say.js
 * ----------------------------------------
 * Handles modal submissions for the /say command.
 *
 * Notes:
 * - Prevents abuse by blocking @everyone/@here/role mentions.
 * - Provides ephemeral confirmation.
 * - Errors are handled gracefully.
 */

module.exports = {
  customID: 'say',

  async execute(interaction) {
    const message = interaction.fields.getTextInputValue('message');

    // 🚫 Prevent abusive mentions
    if (/@everyone|@here|<@&\d+>/.test(message)) {
      return interaction.reply({
        content: '⚠️ Sorry, mass mentions (everyone, here, roles) are not allowed.',
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 }); // ephemeral confirmation

    try {
      await interaction.channel.send(message);
      await interaction.editReply('✅ Your message was sent successfully.');
    } catch (error) {
      console.error('Error in modal /say:', error);
      await interaction.editReply('❌ Failed to send message. Please check if I have permission to post in this channel.');
    }
  },
};
