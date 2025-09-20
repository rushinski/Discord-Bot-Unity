/**
 * File: commands/send/sendRules.js
 * Purpose: Implements the /send-rules command to post server rules in a structured embed.
 *
 * Responsibilities:
 * - Accept a string input of rules separated by the "|" character.
 * - Validate, trim, and auto-number rules for consistency.
 * - Post a rules embed in the current channel.
 *
 * Notes for Recruiters:
 * This command shows how administrators can standardize rule enforcement.
 * It ensures rules are formatted cleanly, consistently numbered, and
 * displayed in a professional embed for server members.
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
        .setDescription('Enter rules separated by "|" (e.g., "Respect.|No spam.|Be kind.")')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const rulesInput = interaction.options.getString('rules');

      // Parse and sanitize input
      let rules = rulesInput
        .split('|')
        .map(rule => rule.trim())
        .filter(rule => rule.length > 0);

      if (rules.length === 0) {
        return interaction.reply({
          content:
            'No valid rules detected.\n\n' +
            'Please separate each rule with the "|" character.\n' +
            'Example:\n```Respect others.|No hate speech.|No spam.```',
          flags: 64, // ephemeral
        });
      }

      // Auto-number rules
      rules = rules.map((rule, idx) => `${idx + 1}. ${rule}`);
      const description = rules.join('\n');

      // Ensure embed does not exceed Discord’s 2000 character limit
      if (description.length > 2000) {
        return interaction.reply({
          content:
            'Rules are too long (exceeds Discord’s 2000 character limit).\n' +
            'Please shorten or split them into multiple messages.',
          flags: 64, // ephemeral
        });
      }

      // Build rules embed
      const rulesEmbed = new EmbedBuilder()
        .setTitle('Server Rules')
        .setDescription(
          '**Rules in this server are enforced with a 3-strike system.**\n' +
          'Three violations may result in a permanent ban.\n\n' +
          description
        )
        .setColor('Green')
        .setTimestamp();

      // Post rules to the channel
      await interaction.channel.send({ embeds: [rulesEmbed] });

      return interaction.reply({
        content: 'Rules have been posted successfully.',
        flags: 64, // ephemeral
      });
    } catch (error) {
      console.error('[SendRules] Execution error:', error);
      return interaction.reply({
        content: 'An error occurred while sending the rules. Please check your input and try again.',
        flags: 64, // ephemeral
      });
    }
  },
};
