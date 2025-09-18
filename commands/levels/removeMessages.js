/**
 * Slash Command: /remove-messages
 * ----------------------------------------
 * Allows administrators to manually remove messages
 * from a user's total message count and update their
 * level accordingly.
 *
 * If a level change occurs (including demotions):
 * - The user is notified privately via DM.
 * - The change is logged in the configured log channel (if set).
 *
 * Responses are always private (ephemeral) to the admin.
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
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The number of messages to remove.')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Permission check
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({
          content: '⚠️ You do not have permission to use this command.',
          ephemeral: true,
        });
      }

      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      // Validate input
      if (amount <= 0) {
        return interaction.reply({
          content: '⚠️ Please specify a valid positive number of messages to remove.',
          ephemeral: true,
        });
      }

      // Fetch user record from database
      let user = await User.findOne({ userId: target.id });

      if (!user) {
        return interaction.reply({
          content: `⚠️ ${target.tag} does not have any recorded messages.`,
          ephemeral: true,
        });
      }

      // Store previous level before modification
      const previousLevel = user.level;

      // Safely decrement messages (prevent negative totals)
      user.messages = Math.max(0, user.messages - amount);

      // Check for level change
      const { hasChanged, newLevel, message } = checkLevelChange(user, levels, previousLevel);

      // Save updates
      await user.save();

      // Build admin confirmation
      let confirmationMessage = `✅ Removed **${amount} messages** from **${target.username}**.\nNew total: **${user.messages} messages**.`;

      if (hasChanged) {
        confirmationMessage += `\n📉 Level change: ${message}`;

        // Notify user via DM
        try {
          await target.send(
            `⚠️ Your level has changed due to message adjustments.\nYou are now **${newLevel}**.`
          );
        } catch {
          console.warn(`Could not send DM to user ${target.id}`);
        }

        // Log to configured guild channel
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (guildConfig && guildConfig.levelUpLogChannel) {
          const logChannel = interaction.guild.channels.cache.get(guildConfig.levelUpLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor(0xED4245) // red
              .setTitle("📉 Level Adjustment")
              .setDescription(`<@${target.id}> has been reassigned to **${newLevel}** (via admin adjustment).`)
              .addFields(
                { name: "Action", value: "Messages Removed", inline: true },
                { name: "Amount", value: `${amount}`, inline: true },
                { name: "New Total", value: `${user.messages}`, inline: true }
              )
              .setTimestamp();

            await logChannel.send({ embeds: [embed] });
          }
        }
      }

      return interaction.reply({
        content: confirmationMessage,
        ephemeral: true,
      });
    } catch (err) {
      console.error('Error executing /remove-messages command:', err);

      return interaction.reply({
        content: '⚠️ An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
