/**
 * File: say.js
 * Command: /say
 *
 * Purpose:
 * Allow administrators to open a modal where they can provide a message
 * for the bot to repeat in the current channel.
 *
 * Responsibilities:
 * - Restrict usage to administrators only.
 * - Prompt the user with a modal for message input.
 * - Defer actual message sending to the modal handler.
 *
 * Recruiter Notes:
 * This command demonstrates secure and structured modal interaction handling,
 * ensuring only authorized users can leverage it.
 */

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = {
  // This property is checked in the core interaction handler (index.js).
  // If true, only administrators can run the command.
  admin: true,

  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Open a modal to type a message that the bot will send'),

  async execute(interaction) {
    // A Modal is a form-like dialog that allows the user to enter text.
    // Here we define a modal with a single text input.
    const modal = new ModalBuilder()
      .setTitle('Provide your message')
      .setCustomId('say'); // Used to identify the modal when submitted

    // A TextInput field is created to capture the message text.
    const input = new TextInputBuilder()
      .setCustomId('message') // Identifier for this field
      .setLabel('Message') // Shown above the input box
      .setPlaceholder('Type your message here') // Light gray hint text
      .setStyle(TextInputStyle.Paragraph) // Allows multiple lines
      .setRequired(true); // Field cannot be left empty

    // A Modal can contain multiple rows of components. Each row can hold one input.
    // We add our TextInput into an ActionRow so it can be rendered properly.
    modal.addComponents(new ActionRowBuilder().addComponents(input));

    // Finally, display the modal to the user who triggered the command.
    // Once submitted, the response is handled by `modals/say.js`.
    await interaction.showModal(modal);
  },
};
