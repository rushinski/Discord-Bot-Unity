/**
 * File: schemas/RoleCountConfig.js
 * Purpose: Defines the schema for tracking live role-based member counts in voice channels.
 *
 * Responsibilities:
 * - Map a guild role to a designated voice channel.
 * - Automatically update the channel name to reflect the number of members with the role.
 * - Support optional labeling and emoji prefixes for clear presentation.
 *
 * Notes for Recruiters:
 * This schema supports the "role count tracker" feature, which is a dynamic display of
 * how many members hold a specific role. For example, a channel named "🐳 Whales: 25"
 * automatically updates when members gain or lose the role.
 */

const { Schema, model, models } = require('mongoose');

const roleCountConfigSchema = new Schema(
  {
    guildId: { type: String, required: true, index: true }, // Discord guild ID
    roleId: { type: String, required: true }, // Role being tracked
    channelId: { type: String, required: true }, // Voice channel where the count is displayed
    label: { type: String, required: true }, // Label shown in the channel name (e.g., "Whales")
    emoji: { type: String, default: '' }, // Optional emoji prefix (e.g., 🐳)
  },
  { timestamps: true, collection: 'roleCountConfigs' }
);

// Ensure each role in a guild can only be tracked once
roleCountConfigSchema.index({ guildId: 1, roleId: 1 }, { unique: true });

module.exports =
  models.RoleCountConfig || model('RoleCountConfig', roleCountConfigSchema);
