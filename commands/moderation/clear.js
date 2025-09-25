/**
 * Command: /clear
 *
 * Purpose:
 * Allow administrators to bulk delete a specified number of recent messages
 * from the current channel, within Discord API limitations.
 *
 * Responsibilities:
 * - Verify the invoking user and bot both have "Manage Messages" permission.
 * - Delete up to the specified number of recent messages (1–100).
 * - Exclude messages older than 14 days (not deletable by Discord API).
 * - Provide clear, professional feedback to the user.
 *
 * Recruiter Notes:
 * This command demonstrates careful permission handling and adherence
 * to platform constraints. It also shows professional user communication
 * and robust error handling.
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a specified number of recent messages in this channel.')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const channel = interaction.channel;

    try {
      // Ensure the bot has the required permission in this channel.
      if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({
          content: 'The bot does not have permission to manage messages in this channel.',
          flags: 64, // Ephemeral reply
        });
      }

      // Defer reply to prevent timeout while processing.
      await interaction.deferReply({ flags: 64 });

      // Fetch the most recent messages up to the requested amount.
      const fetched = await channel.messages.fetch({ limit: amount });

      // Filter out any messages older than 14 days (API restriction).
      const twoWeeks = 14 * 24 * 60 * 60 * 1000;
      const deletable = fetched.filter(msg => msg.createdTimestamp > Date.now() - twoWeeks);

      if (deletable.size === 0) {
        return interaction.editReply(
          'No messages could be deleted because they are older than 14 days.'
        );
      }

      // Bulk delete all eligible messages.
      await channel.bulkDelete(deletable, true);

      return interaction.editReply(`Successfully deleted ${deletable.size} message(s).`);
    } catch (error) {
      console.error('[Moderation:clear] Error executing command:', error);
      return interaction.editReply({
        content: 'An error occurred while attempting to clear messages. Please try again later.',
      });
    }
  },
};
