const { Schema, model } = require('mongoose');

/**
 * GuildConfig Schema
 * ----------------------------------------
 * Stores per-guild configuration for log channels
 * and other customizable settings.
 *
 * Fields:
 * - moderationLogChannel: Text channel for moderation logs
 * - ticketTranscriptsChannel: Text channel for ticket transcripts
 * - createdTicketCategory: Category for created tickets
 * - joinLeaveLogChannel: Text channel for join/leave logs
 * - welcomeChannel: Text channel for welcome messages
 * - memberCountChannel: Voice channel displaying total members
 * - levelUpLogChannel: Text channel for logging level-up events
 * - utcTimeChannel: Voice channel displaying current UTC time
 * - utcDateChannel: Voice channel displaying current UTC date
 */

const guildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  moderationLogChannel: { type: String, default: null },
  ticketTranscriptsChannel: { type: String, default: null },
  createdTicketCategory: { type: String, default: null },
  joinLeaveLogChannel: { type: String, default: null },
  welcomeChannel: { type: String, default: null },
  memberCountChannel: { type: String, default: null },
  levelUpLogChannel: { type: String, default: null },
  utcTimeChannel: { type: String, default: null },
  utcDateChannel: { type: String, default: null },
});

module.exports = model('GuildConfig', guildConfigSchema);
