/**
 * Event: messageCreate
 * ----------------------------------------
 * Triggered whenever a user sends a message.
 * - Increments the user's total message count.
 * - Automatically recalculates and assigns level
 *   based on configured thresholds in data/levels.js.
 * - Sends a private DM if the user has leveled up
 *   (or down) and notifications are enabled.
 * - Optionally logs level changes to a configured
 *   channel if set via /set level-up-log.
 */

const { EmbedBuilder } = require('discord.js');
const User = require('../schemas/userSchema');
const GuildConfig = require('../schemas/config');
const levels = require('../data/levels');
const { recalculateLevel, checkLevelChange } = require('../utils/levelUtils');

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;

    try {
      // Atomically increment message count and return updated user
      let user = await User.findOneAndUpdate(
        { userId },
        { $inc: { messages: 1 } },
        { new: true, upsert: true }
      );

      // Ensure default properties if user is new
      if (!user.level) {
        user.level = levels[0].level;
        user.notificationsEnabled = true;
      }

      // Compare previous vs new level
      const previousLevel = user.level;
      const { hasChanged, newLevel } = checkLevelChange(user, levels, previousLevel);

      // Save updated user
      await user.save();

      // If the user's level changed and notifications are enabled
      if (hasChanged && user.notificationsEnabled) {
        // Try to send private DM
        try {
          await message.author.send(
            `🎉 Congratulations! Your level has changed: you are now **${newLevel}**.`
          );
        } catch {
          console.warn(`Could not send DM to user ${userId}`);
        }

        // Also log to configured guild channel (if set)
        const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
        if (guildConfig && guildConfig.levelUpLogChannel) {
          const logChannel = message.guild.channels.cache.get(guildConfig.levelUpLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor(0x5865F2) // blurple
              .setTitle("📈 Level Up!")
              .setDescription(`<@${userId}> has been reassigned to **${newLevel}**.`)
              .addFields(
                { name: "Total Messages", value: `${user.messages}`, inline: true }
              )
              .setTimestamp();

            await logChannel.send({ embeds: [embed] });
          }
        }
      }
    } catch (err) {
      console.error('Error handling messageCreate event:', err);
    }
  },
};
