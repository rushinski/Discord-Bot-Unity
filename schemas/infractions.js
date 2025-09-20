/**
 * File: schemas/infractions.js
 * Purpose: Defines the schema for tracking moderation infractions against guild members.
 *
 * Responsibilities:
 * - Store warnings and strikes issued to users for rule violations.
 * - Enforce escalation policies (e.g., warnings → strikes, strikes → bans).
 * - Ensure infractions are tied uniquely to each user within a guild.
 *
 * Notes for Recruiters:
 * This schema provides persistence for moderation actions,
 * ensuring consistency across sessions. It helps enforce
 * disciplinary rules fairly, with structured escalation.
 */

const { Schema, model, models } = require('mongoose');

const infractionsSchema = new Schema(
  {
    guildId: { type: String, required: true, index: true }, // Discord guild ID
    userId: { type: String, required: true, index: true }, // Discord user ID
    warnings: { type: Number, default: 0, min: 0 }, // Count of warnings (e.g., 2 warnings escalate into 1 strike)
    strikes: { type: Number, default: 0, min: 0 }, // Count of strikes (e.g., 3 strikes escalate into a ban)
  },
  { timestamps: true, collection: 'infractions' }
);

// Ensure each user has only one infraction record per guild
infractionsSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = models.Infractions || model('Infractions', infractionsSchema);
