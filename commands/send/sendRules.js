/**
 * Slash Command: /send-rules
 * ----------------------------------------
 * Sends an embed containing server rules provided by the admin.
 *
 * Behavior:
 * - Accepts a single string where rules are separated by the "|" character.
 * - Automatically numbers rules for consistency.
 * - Posts rules as an embed in the current channel.
 *
 * Formatting Instructions for Admins:
 * - Separate each rule with the "|" character.
 *   Example:
 *     Respect others.|No hate speech.|No spam.
 * - The bot will format them into a clean, numbered list:
 *     1. Respect others.
 *     2. No hate speech.
 *     3. No spam.
 *
 * Notes:
 * - Empty rules and extra spaces are ignored.
 * - Ephemeral responses use flags: 64 for feedback and errors.
 * - Embed descriptions are capped at 2000 characters (Discord limit).
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-rules')
    .setDescription('Send server rules (separate each rule with "|").')
    .addStringOption(option =>
      option
        .setName('rules')
        .setDescription('Enter rules separated by "|" (e.g. "Respect.|No spam.|Be kind.")')
        .setRequired(true),
    ),

  async execute(interaction) {
    try {
      const rulesInput = interaction.options.getString('rules');

      // Split by delimiter, trim, and filter out empties
      let rules = rulesInput
        .split('|')
        .map(rule => rule.trim())
        .filter(rule => rule.length > 0);

      // Validate
      if (rules.length === 0) {
        return interaction.reply({
          content:
            '⚠️ No valid rules detected.\n\n' +
            'Please separate each rule with the "|" character.\n' +
            'Example:\n```\nRespect others.|No hate speech.|No spam.\n```',
          flags: 64,
        });
      }

      // Auto-number rules
      rules = rules.map((rule, idx) => `${idx + 1}. ${rule}`);

      const description = rules.join('\n');

      if (description.length > 2000) {
        return interaction.reply({
          content:
            '⚠️ Rules are too long (exceeds Discord’s 2000 character limit).\n' +
            'Please shorten or split them into multiple messages.',
          flags: 64,
        });
      }

      // Build embed
      const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Server Rules')
        .setDescription(
          '**Rules in this server will be enforced with a 3-strike system.**\n' +
          'Three rule breaks and you will be banned.\n\n' +
          description,
        )
        .setColor('Green')
        .setTimestamp();

      // Send rules to channel
      await interaction.channel.send({ embeds: [rulesEmbed] });

      return interaction.reply({
        content: '✅ Rules have been posted successfully.',
        flags: 64,
      });
    } catch (error) {
      console.error('Error in /send-rules:', error);
      return interaction.reply({
        content:
          '❌ An error occurred while sending the rules. Please check your input and try again.',
        flags: 64,
      });
    }
  },
};
