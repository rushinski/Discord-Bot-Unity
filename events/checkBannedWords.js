/**
 * Event: messageCreate → Banned Word Check
 * ----------------------------------------
 * Purpose:
 * - Detect and handle use of banned words/phrases in messages.
 * - Apply severity-based moderation actions:
 *   - low: warning only (2 warnings = 1 strike)
 *   - medium: 1 strike
 *   - high: 2 strikes
 *   - critical: instant ban
 *
 * Behavior:
 * - Deletes offending messages immediately.
 * - Tracks warnings and strikes in the Infractions schema.
 * - Bans users after 3 strikes or on critical offenses.
 * - Logs all actions to a configured moderation log channel.
 * - Notifies the offender via DM.
 *
 * Dependencies:
 * - data/bannedWords.js (defines words + severity levels)
 * - schemas/infractions.js (stores warnings + strikes per user/guild)
 * - schemas/config.js (provides log channel IDs)
 *
 * Notes:
 * - Uses fuzzy matching (Levenshtein distance) to detect obfuscated words.
 * - Logs errors to console and provides error notices to admins if moderation fails.
 */

const { EmbedBuilder } = require('discord.js');
const levenshtein = require('fast-levenshtein');
const bannedWords = require('../data/bannedWords');
const Infractions = require('../schemas/infractions');
const GuildConfig = require('../schemas/config');

// Fuzzy matching check
function isSimilar(word, messageContent, threshold = 0.8) {
  const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedMessage = messageContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const distance = levenshtein.get(normalizedWord.toLowerCase(), normalizedMessage.toLowerCase());
  const similarity = 1 - distance / Math.max(normalizedWord.length, normalizedMessage.length);
  return similarity >= threshold;
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const match = bannedWords.find(entry => isSimilar(entry.word, message.content));
    if (!match) return;

    try {
      const originalContent = message.content; // ✅ Save content before deletion
      await message.delete();

      const { guild, author } = message;
      const userId = author.id;

      let userInfractions = await Infractions.findOne({ userId, guildId: guild.id });
      if (!userInfractions) {
        userInfractions = new Infractions({ userId, guildId: guild.id, strikes: 0, warnings: 0 });
      }

      let actionTaken = '';

      // Apply severity rules
      if (match.severity === 'critical') {
        // ✅ DM before banning
        try {
          await author.send(
            `🚫 You have been **banned** from **${guild.name}** for using a critical banned word.\n` +
            `**Word Used:** ${match.word}`
          );
        } catch {
          console.warn(`Could not DM ${author.tag} before banning`);
        }

        await guild.members.ban(userId, { reason: `Critical banned word: ${match.word}` });
        actionTaken = 'User banned (critical offense)';
      } else if (match.severity === 'high') {
        userInfractions.strikes += 2;
        actionTaken = '2 strikes (high severity)';
      } else if (match.severity === 'medium') {
        userInfractions.strikes += 1;
        actionTaken = '1 strike (medium severity)';
      } else if (match.severity === 'low') {
        userInfractions.warnings = (userInfractions.warnings || 0) + 1;
        if (userInfractions.warnings >= 2) {
          userInfractions.warnings = 0; // Reset warnings
          userInfractions.strikes += 1;
          actionTaken = 'Converted 2 warnings into 1 strike';
        } else {
          actionTaken = 'Warning issued (low severity)';
        }
      }

      await userInfractions.save();

      // ✅ Ban if strike threshold reached
      if (userInfractions.strikes >= 3) {
        try {
          await author.send(
            `🚫 You have been **banned** from **${guild.name}** after reaching 3 strikes for banned words.`
          );
        } catch {
          console.warn(`Could not DM ${author.tag} before banning`);
        }

        await guild.members.ban(userId, { reason: 'Reached 3 strikes for banned words' });
        actionTaken = 'User banned (3 strikes)';
        userInfractions.strikes = 0;
        userInfractions.warnings = 0;
        await userInfractions.save();
      }

      // ✅ DM the offender (only if not already banned above)
      if (!['User banned (critical offense)', 'User banned (3 strikes)'].includes(actionTaken)) {
        try {
          await author.send(
            `⚠️ You used a banned word in **${guild.name}**.\n` +
            `**Word Used:** ${match.word}\n` +
            `**Action Taken:** ${actionTaken}\n` +
            `Current strikes: ${userInfractions.strikes}/3.`
          );
        } catch {
          console.warn(`Could not DM ${author.tag}`);
        }
      }

      // ✅ Log to moderation channel
      const logChannelData = await GuildConfig.findOne({ guildId: guild.id });
      if (logChannelData?.moderationLogChannel) {
        const logChannel = guild.channels.cache.get(logChannelData.moderationLogChannel);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Banned Word Detected')
            .setColor('Red')
            .addFields(
              { name: 'User', value: `${author.tag} (<@${userId}>)` },
              { name: 'Message Content', value: originalContent || 'No content' }, // ✅ Preserved content
              { name: 'Banned Word', value: match.word }, // ✅ Explicit banned word
              { name: 'Severity', value: match.severity },
              { name: 'Action Taken', value: actionTaken },
              { name: 'Strikes', value: `${userInfractions.strikes}/3` },
              { name: 'Warnings', value: `${userInfractions.warnings || 0}/2` },
              { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
            );

          await logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Error handling banned word detection:', error);

      // Attempt to notify admins via log channel
      try {
        const logChannelData = await GuildConfig.findOne({ guildId: message.guild.id });
        if (logChannelData?.moderationLogChannel) {
          const logChannel = message.guild.channels.cache.get(logChannelData.moderationLogChannel);
          if (logChannel) {
            await logChannel.send({
              content: `❌ Error occurred while processing banned word detection for <@${message.author.id}>. Check console logs for details.`,
            });
          }
        }
      } catch {
        // Fallback: if logging also fails, just rely on console
      }
    }
  },
};
