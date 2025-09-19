/**
 * Infractions Schema
 * ------------------
 * Tracks user infractions (warnings + strikes) for moderation.
 * Used in conjunction with banned word detection and other moderation
 * events to enforce community rules.
 *
 * Behavior:
 * - Warnings accumulate from low-severity banned words.
 *   (2 warnings = 1 strike)
 * - Strikes accumulate from medium/high severity infractions.
 * - Critical severity results in immediate ban.
 * - 3 strikes = automatic ban.
 *
 * Example:
 * {
 *   guildId: "1234567890",
 *   userId: "9876543210",
 *   warnings: 1,
 *   strikes: 2
 * }
 */

const mongoose = require('mongoose');

const InfractionsSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      description: 'Guild/server ID',
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      description: 'User ID of the member receiving infractions',
    },
    warnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      description: 'Number of warnings (2 warnings = 1 strike)',
    },
    strikes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      description: 'Number of strikes (3 strikes = ban)',
    },
  },
  {
    timestamps: true,
    collection: 'infractions',
  }
);

// Ensure uniqueness per guild-user pair
InfractionsSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Infractions', InfractionsSchema);
