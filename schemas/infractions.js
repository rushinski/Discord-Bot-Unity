/**
 * Schema: Infractions
 * Purpose: Track warnings and strikes issued to users for moderation purposes.
 *
 * Fields:
 * - guildId: Discord guild (server) identifier.
 * - userId: Discord user identifier for the member receiving infractions.
 * - warnings: Count of warnings (2 warnings escalate into 1 strike).
 * - strikes: Count of strikes (3 strikes escalate into a ban).
 *
 * Notes for Recruiters:
 * This schema supports moderation by persisting violations and enabling
 * escalation rules. The design ensures that discipline is consistent
 * across sessions and unique per user per guild.
 */

const mongoose = require('mongoose');

const infractionsSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, trim: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },
    warnings: { type: Number, default: 0, min: 0 },
    strikes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'infractions' }
);

// Ensure uniqueness per guild-user pair.
infractionsSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Infractions', infractionsSchema);
