/**
 * Slash Command: /say
 * ----------------------------------------
 * Opens a modal where the user can type a message
 * for the bot to repeat in the current channel.
 *
 * Notes:
 * - Uses modal for multi-line input.
 * - Works with the corresponding handler in modals/say.js.
 * - Restricted to admins only.
 */

const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  admin: true, // mark as admin-only
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Open a modal to say something as the bot'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setTitle('Say something!')
      .setCustomId('say');

    const input = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Message')
      .setPlaceholder('Type your message here...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  },
};
