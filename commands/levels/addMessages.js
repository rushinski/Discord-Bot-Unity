/**
 * Slash Command: /add-messages
 * ----------------------------------------
 * Allows administrators to manually add messages
 * to a user's total message count. If the update
 * causes the user's level to change (up or down):
 * - The user is notified privately via DM.
 * - The change is logged in the configured log channel (if set).
 *
 * Responses are always private (ephemeral) to the admin.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const GuildConfig = require('../../schemas/config');
const levels = require('../../data/levels');
const { checkLevelChange } = require('../../utils/levelUtils');

module.exports = {
  admin: true,

  // Define the slash command structure
  data: new SlashCommandBuilder()
    .setName('add-messages')
    .setDescription("Manually add messages to a user's total.")
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The user to update.')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to add.')
        .setRequired(true),
    ),

  // Command execution handler
  async execute(interaction) {
    try {
      // Extract input values from the slash command
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');

      // Validate input: must be a positive number
      if (amount <= 0) {
        return interaction.reply({
          content: '⚠️ Please provide a valid positive number.',
          flags: 64,
        });
      }

      // Look up the user in the database, or create a new record if none exists
      let user = await User.findOne({ userId: target.id });

      if (!user) {
        user = new User({
          userId: target.id,
          messages: 0,
          level: levels[0].level, // default starting level
          notificationsEnabled: true,
        });
      }

      // Store previous level before modification
      const previousLevel = user.level;

      // Increment the user's message count
      user.messages += amount;

      // Check if the user's level has changed
      const { hasChanged, newLevel, message } = checkLevelChange(user, levels, previousLevel);

      // Save updated user data back to the database
      await user.save();

      // Build admin response
      let replyMessage = `✅ Added **${amount} messages** to **${target.username}**.\nNew total: **${user.messages} messages**.`;

      if (hasChanged) {
        replyMessage += `\n📈 Level change: ${message}`;

        // Notify user via DM
        try {
          await target.send(
            `🎉 Your level has changed! You are now **${newLevel}**. Keep up the great work!`
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
              .setColor(0x57F287) // green
              .setTitle("📈 Level Adjustment")
              .setDescription(`<@${target.id}> has been reassigned to **${newLevel}** (via admin adjustment).`)
              .addFields(
                { name: "Action", value: "Messages Added", inline: true },
                { name: "Amount", value: `${amount}`, inline: true },
                { name: "New Total", value: `${user.messages}`, inline: true }
              )
              .setTimestamp();

            await logChannel.send({ embeds: [embed] });
          }
        }
      }

      // Respond privately to the admin
      return interaction.reply({
        content: replyMessage,
        flags: 64,
      });
    } catch (error) {
      console.error('Error in /add-messages command:', error);

      return interaction.reply({
        content: '❌ An error occurred while processing this command. Please try again later.',
        flags: 64,
      });
    }
  },
};
