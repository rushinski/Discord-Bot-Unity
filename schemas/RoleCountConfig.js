/**
 * RoleCountConfig Schema
 * ----------------------
 * Stores configuration for role-based count trackers.
 * Each entry maps a guild/role to a voice channel that
 * dynamically updates its name with the number of users.
 *
 * Example:
 * {
 *   guildId: "1234567890",
 *   roleId: "9876543210",
 *   channelId: "2468135790",
 *   label: "Whales",
 *   emoji: "🐳"
 * }
 */

const mongoose = require('mongoose');

const RoleCountConfigSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      description: 'Guild/server ID',
    },
    roleId: {
      type: String,
      required: true,
      trim: true,
      description: 'Target role ID to count members of',
    },
    channelId: {
      type: String,
      required: true,
      trim: true,
      description: 'Voice channel ID where the role count is displayed',
    },
    label: {
      type: String,
      required: true,
      trim: true,
      description: 'Label used in the channel name (e.g., "Whales")',
    },
    emoji: {
      type: String,
      required: false,
      default: '',
      trim: true,
      description: 'Optional emoji prefix for the channel name',
    },
  },
  {
    timestamps: true,
    collection: 'roleCountConfigs',
  }
);

// Ensure uniqueness of role trackers per guild
RoleCountConfigSchema.index({ guildId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model('RoleCountConfig', RoleCountConfigSchema);
