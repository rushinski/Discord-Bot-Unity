/**
 * Event: messageCreate
 * Purpose: Handle user messages for leveling system.
 *
 * Responsibilities:
 * - Increment a user's message count each time they send a message.
 * - Check if the user qualifies for a level change based on thresholds in data/levels.js.
 * - Persist changes to the user profile in MongoDB.
 * - Send direct notifications for level changes if enabled.
 * - Optionally log level changes to a configured guild channel.
 *
 * Notes for Recruiters:
 * This event demonstrates a basic engagement mechanic.
 * It tracks participation (message counts) and translates that into "levels"
 * to encourage user activity. The system is modular and configurable per guild.
 */

const { EmbedBuilder } = require('discord.js');
const User = require('../schemas/userSchema');
const GuildConfig = require('../schemas/config');
const levels = require('../data/levels');
const { checkLevelChange } = require('../utils/levelUtils');

module.exports = {
  name: 'messageCreate',

  /**
   * Execute handler for the messageCreate event.
   * @param {import('discord.js').Message} message - The message object from Discord.js.
   */
  async execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;

    try {
      // Atomically increment the user's message count
      let user = await User.findOneAndUpdate(
        { userId },
        { $inc: { messages: 1 } },
        { new: true, upsert: true }
      );

      // Assign defaults if the user record is newly created
      if (!user.level) {
        user.level = levels[0].level;
        user.notificationsEnabled = true;
      }

      // Determine whether the user's level has changed
      const previousLevel = user.level;
      const { hasChanged, newLevel } = checkLevelChange(user, levels, previousLevel);

      // Persist the updated user record
      await user.save();

      if (hasChanged && user.notificationsEnabled) {
        // Notify user via direct message if possible
        try {
          await message.author.send(
            `Congratulations! Your level has changed: you are now **${newLevel}**.`
          );
        } catch {
          console.warn(`[messageCreate] Unable to send DM to user ${userId}`);
        }

        // If configured, log the level change in the guild's designated channel
        const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
        if (guildConfig && guildConfig.levelUpLogChannel) {
          const logChannel = message.guild.channels.cache.get(guildConfig.levelUpLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor(0x5865F2) // Discord's blurple
              .setTitle('Level Update')
              .setDescription(`<@${userId}> has reached level **${newLevel}**.`)
              .addFields({ name: 'Total Messages', value: `${user.messages}`, inline: true })
              .setTimestamp();

            await logChannel.send({ embeds: [embed] });
          }
        }
      }
    } catch (err) {
      console.error('[messageCreate] Error handling message event:', err);
    }
  },
};
