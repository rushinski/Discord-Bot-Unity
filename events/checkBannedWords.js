/**
 * Event: messageCreate → Banned Word Check
 *
 * Purpose:
 * Detect and handle use of banned words or phrases in messages. Apply
 * severity-based moderation actions consistently across the server.
 *
 * Responsibilities:
 * - Monitor messages for banned content using fuzzy matching.
 * - Delete offending messages immediately.
 * - Apply escalation rules:
 *   - Low severity → warning (two warnings = one strike).
 *   - Medium severity → one strike.
 *   - High severity → two strikes.
 *   - Critical severity → immediate ban.
 * - Track warnings and strikes in the Infractions schema.
 * - Ban users after three strikes or on critical offenses.
 * - Log all actions to a configured moderation log channel.
 * - Notify the offender via direct message when possible.
 *
 * Recruiter Notes:
 * This event demonstrates responsible moderation enforcement. Input is
 * sanitized, escalation rules are consistently applied, and actions are
 * logged for transparency. Error handling ensures that failures in
 * notification or logging do not compromise the enforcement process.
 */

const { EmbedBuilder } = require('discord.js');
const levenshtein = require('fast-levenshtein');
const bannedWords = require('../data/bannedWords');
const Infractions = require('../schemas/infractions');
const GuildConfig = require('../schemas/config');

/**
 * Check if two strings are similar enough to be considered a match.
 * Used to detect obfuscated variants of banned words.
 * @param {string} word - The banned word to check against.
 * @param {string} messageContent - The user-provided message content.
 * @param {number} threshold - Similarity threshold (0–1).
 * @returns {boolean} True if similarity is greater than or equal to threshold.
 */
function isSimilar(word, messageContent, threshold = 0.8) {
  const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedMessage = messageContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const distance = levenshtein.get(normalizedWord.toLowerCase(), normalizedMessage.toLowerCase());
  const similarity = 1 - distance / Math.max(normalizedWord.length, normalizedMessage.length);
  return similarity >= threshold;
}

module.exports = {
  name: 'messageCreate',

  /**
   * Execute the banned word check for a new message.
   * @param {object} message - The Discord message object.
   */
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // Identify the first banned word match (if any).
    const match = bannedWords.find(entry => isSimilar(entry.word, message.content));
    if (!match) return;

    try {
      const originalContent = message.content;
      await message.delete();

      const { guild, author } = message;
      const userId = author.id;

      // Retrieve or initialize user infractions record.
      let userInfractions = await Infractions.findOne({ userId, guildId: guild.id });
      if (!userInfractions) {
        userInfractions = new Infractions({ userId, guildId: guild.id, strikes: 0, warnings: 0 });
      }

      let actionTaken = '';

      // Apply severity-based discipline.
      if (match.severity === 'critical') {
        // Notify the user before banning, if possible.
        try {
          await author.send(
            `You have been banned from "${guild.name}" for using a prohibited word.\n` +
            `Banned Word: ${match.word}`
          );
        } catch {
          console.warn(`[Moderation] Could not notify ${author.tag} before banning.`);
        }

        await guild.members.ban(userId, { reason: `Critical banned word: ${match.word}` });
        actionTaken = 'User banned (critical offense)';
      } else if (match.severity === 'high') {
        userInfractions.strikes += 2;
        actionTaken = 'Two strikes issued (high severity).';
      } else if (match.severity === 'medium') {
        userInfractions.strikes += 1;
        actionTaken = 'One strike issued (medium severity).';
      } else if (match.severity === 'low') {
        userInfractions.warnings = (userInfractions.warnings || 0) + 1;
        if (userInfractions.warnings >= 2) {
          userInfractions.warnings = 0;
          userInfractions.strikes += 1;
          actionTaken = 'Two warnings converted into one strike.';
        } else {
          actionTaken = 'Warning issued (low severity).';
        }
      }

      await userInfractions.save();

      // Enforce ban if the user has reached three strikes.
      if (userInfractions.strikes >= 3) {
        try {
          await author.send(
            `You have been banned from "${guild.name}" after reaching three strikes for repeated violations.`
          );
        } catch {
          console.warn(`[Moderation] Could not notify ${author.tag} before banning.`);
        }

        await guild.members.ban(userId, { reason: 'Three strikes for banned words' });
        actionTaken = 'User banned (three strikes).';
        userInfractions.strikes = 0;
        userInfractions.warnings = 0;
        await userInfractions.save();
      }

      // Notify user if not already banned.
      if (!actionTaken.includes('banned')) {
        try {
          await author.send(
            `A prohibited word was detected in "${guild.name}".\n` +
            `Banned Word: ${match.word}\n` +
            `Action Taken: ${actionTaken}\n` +
            `Current Strikes: ${userInfractions.strikes}/3`
          );
        } catch {
          console.warn(`[Moderation] Could not notify ${author.tag} of infraction.`);
        }
      }

      // Log details to the moderation channel, if configured.
      const logChannelData = await GuildConfig.findOne({ guildId: guild.id });
      if (logChannelData?.moderationLogChannel) {
        const logChannel = guild.channels.cache.get(logChannelData.moderationLogChannel);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Banned Word Detected')
            .setColor('Red')
            .addFields(
              { name: 'User', value: `${author.tag} (<@${userId}>)`, inline: false },
              { name: 'Message Content', value: originalContent || 'No content', inline: true },
              { name: 'Banned Word', value: match.word, inline: true },
              { name: 'Severity', value: match.severity, inline: true },
              { name: 'Action Taken', value: actionTaken, inline: true },
              { name: 'Strikes', value: `${userInfractions.strikes}/3`, inline: true },
              { name: 'Warnings', value: `${userInfractions.warnings || 0}/2`, inline: true }
            )
            .setFooter({ text: `Message sent at: ${new Date().toLocaleString()}` });

          await logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('[Moderation] Error handling banned word detection:', error);

      // Attempt to notify admins of error via log channel.
      try {
        const logChannelData = await GuildConfig.findOne({ guildId: message.guild.id });
        if (logChannelData?.moderationLogChannel) {
          const logChannel = message.guild.channels.cache.get(logChannelData.moderationLogChannel);
          if (logChannel) {
            await logChannel.send({
              content: `An error occurred while processing banned word detection for <@${message.author.id}>. See logs for details.`,
            });
          }
        }
      } catch {
        // Fallback: rely on console logs if admin notification also fails.
      }
    }
  },
};
