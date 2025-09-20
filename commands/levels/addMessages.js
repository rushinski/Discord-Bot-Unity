/**
 * Command: /add-messages
 * Purpose: Allow administrators to manually adjust a user's message count.
 *
 * Responsibilities:
 * - Increment a user's message count by a specified amount.
 * - Recalculate the user's level based on configured thresholds.
 * - Persist updates to the database.
 * - Notify the user privately if their level changes.
 * - Optionally log the adjustment to the guild's configured log channel.
 *
 * Notes for Recruiters:
 * This command demonstrates administrative overrides in the leveling system.
 * It allows staff to make manual adjustments while ensuring all standard
 * progression logic and logging remain consistent.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const GuildConfig = require('../../schemas/config');
const levels = require('../../data/levels');
const { checkLevelChange } = require('../../utils/levelUtils');

module.exports = {
  admin: true,

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

  /**
   * Execution handler for /add-messages.
   * @param {import('discord.js').CommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');

      // Validate positive input
      if (amount <= 0) {
        return interaction.reply({
          content: 'Please provide a positive number of messages to add.',
          flags: 64,
        });
      }

      // Retrieve or create user record
      let user = await User.findOne({ userId: target.id });
      if (!user) {
        user = new User({
          userId: target.id,
          messages: 0,
          level: levels[0].level,
          notificationsEnabled: true,
        });
      }

      const previousLevel = user.level;
      user.messages += amount;

      // Recalculate level progression
      const { hasChanged, newLevel, message } = checkLevelChange(user, levels, previousLevel);
      await user.save();

      // Build private admin response
      let replyMessage = `Added **${amount} messages** to **${target.username}**.\nNew total: **${user.messages} messages**.`;

      if (hasChanged) {
        replyMessage += `\nLevel update: ${message}`;

        // Attempt to notify user via DM
        try {
          await target.send(`Your level has been updated. You are now **${newLevel}**.`);
        } catch {
          console.warn(`[add-messages] Unable to send DM to user ${target.id}`);
        }

        // Log to guild channel if configured
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (guildConfig && guildConfig.levelUpLogChannel) {
          const logChannel = interaction.guild.channels.cache.get(guildConfig.levelUpLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor(0x57F287)
              .setTitle('Level Adjustment')
              .setDescription(`<@${target.id}> has been reassigned to **${newLevel}** (via admin adjustment).`)
              .addFields(
                { name: 'Action', value: 'Messages Added', inline: true },
                { name: 'Amount', value: `${amount}`, inline: true },
                { name: 'New Total', value: `${user.messages}`, inline: true },
              )
              .setTimestamp();

            await logChannel.send({ embeds: [embed] });
          }
        }
      }

      return interaction.reply({
        content: replyMessage,
        flags: 64,
      });
    } catch (error) {
      console.error('[add-messages] Command execution failed:', error);
      return interaction.reply({
        content: 'An error occurred while processing this command. Please try again later.',
        flags: 64,
      });
    }
  },
};
