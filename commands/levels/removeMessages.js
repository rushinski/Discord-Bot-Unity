/**
 * Command: /remove-messages
 * Purpose: Allow administrators to decrement a user's message count and update their level.
 *
 * Responsibilities:
 * - Validate that the executing user has sufficient permissions.
 * - Safely decrement the target user's total message count.
 * - Recalculate the target user's level and persist changes.
 * - Notify the user privately if their level has changed.
 * - Optionally log the adjustment in the guild's configured log channel.
 * - Respond privately to the administrator with confirmation.
 *
 * Notes for Recruiters:
 * This command demonstrates administrative overrides that enforce
 * consistency with progression logic while maintaining auditability
 * through logging and user notifications.
 */

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const GuildConfig = require('../../schemas/config');
const levels = require('../../data/levels');
const { checkLevelChange } = require('../../utils/levelUtils');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('remove-messages')
    .setDescription("Remove messages from a user's total.")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose messages will be adjusted.')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The number of messages to remove.')
        .setRequired(true),
    ),

  /**
   * Execution handler for /remove-messages.
   * @param {import('discord.js').CommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    try {
      // Verify administrator permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({
          content: 'You do not have permission to use this command.',
          flags: 64,
        });
      }

      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      // Validate input (must be a positive integer)
      if (amount <= 0) {
        return interaction.reply({
          content: 'Please specify a positive number of messages to remove.',
          flags: 64,
        });
      }

      let user = await User.findOne({ userId: target.id });

      if (!user) {
        return interaction.reply({
          content: `${target.tag} does not have any recorded messages.`,
          flags: 64,
        });
      }

      const previousLevel = user.level;

      // Safely decrement, preventing negative totals
      user.messages = Math.max(0, user.messages - amount);

      // Recalculate level and check for changes
      const { hasChanged, newLevel, message } = checkLevelChange(user, levels, previousLevel);
      await user.save();

      // Build private confirmation message for admin
      let confirmationMessage =
        `Removed **${amount} messages** from **${target.username}**.\n` +
        `New total: **${user.messages} messages**.`;

      if (hasChanged) {
        confirmationMessage += `\nLevel update: ${message}`;

        // Notify the affected user via DM
        try {
          await target.send(
            `Your level has been updated due to message adjustments.\nYou are now **${newLevel}**.`
          );
        } catch {
          console.warn(`[remove-messages] Unable to send DM to user ${target.id}`);
        }

        // Log adjustment to the guild channel if configured
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (guildConfig && guildConfig.levelUpLogChannel) {
          const logChannel = interaction.guild.channels.cache.get(guildConfig.levelUpLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor(0xed4245) // red
              .setTitle('Level Adjustment')
              .setDescription(
                `<@${target.id}> has been reassigned to **${newLevel}** (via admin adjustment).`
              )
              .addFields(
                { name: 'Action', value: 'Messages Removed', inline: true },
                { name: 'Amount', value: `${amount}`, inline: true },
                { name: 'New Total', value: `${user.messages}`, inline: true },
              )
              .setTimestamp();

            await logChannel.send({ embeds: [embed] });
          }
        }
      }

      return interaction.reply({
        content: confirmationMessage,
        flags: 64,
      });
    } catch (err) {
      console.error('[remove-messages] Command execution failed:', err);

      return interaction.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        flags: 64,
      });
    }
  },
};
