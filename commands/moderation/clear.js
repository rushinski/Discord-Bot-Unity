/**
 * Slash Command: /clear
 * ----------------------------------------
 * Deletes a specified number of recent messages in the current channel.
 *
 * Example:
 *   /clear amount:25
 *
 * Notes:
 * - Bot requires the "Manage Messages" permission in the channel.
 * - Only messages younger than 14 days can be deleted due to Discord API limits.
 * - Restricted to users with "Manage Messages" permission.
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
        .setMaxValue(100),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const channel = interaction.channel;

    try {
      // ✅ Ensure bot has permission in this channel
      if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({
          content: '⚠️ I do not have permission to manage messages in this channel.',
          flags: 64,
        });
      }

      await interaction.deferReply({ flags: 64 }); // Prevent timeout

      // ✅ Fetch up to {amount} recent messages
      const fetched = await channel.messages.fetch({ limit: amount });

      // ✅ Filter out messages older than 14 days
      const twoWeeks = 14 * 24 * 60 * 60 * 1000; // ms
      const deletable = fetched.filter(msg => msg.createdTimestamp > Date.now() - twoWeeks);

      if (deletable.size === 0) {
        return interaction.editReply('⚠️ No messages could be deleted (they may be older than 14 days).');
      }

      // ✅ Bulk delete eligible messages
      await channel.bulkDelete(deletable, true);

      return interaction.editReply(`🧹 Successfully deleted **${deletable.size}** message(s).`);
    } catch (error) {
      console.error('❌ Error in /clear command:', error);
      return interaction.editReply({
        content: '❌ An unexpected error occurred while trying to clear messages. Please try again later.',
      });
    }
  },
};
