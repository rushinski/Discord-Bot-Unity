/**
 * RoleReactionMessage Schema
 * --------------------------
 * Stores configuration for reaction-role messages.
 * Each record links a guild/channel/message to a category type
 * and its associated role-emoji mappings.
 *
 * Example:
 * {
 *   messageType: "continent",
 *   roles: [{ emoji: "🦁", roleName: "Africa" }],
 *   description: "Select your continent"
 * }
 */

const mongoose = require('mongoose');

const RoleReactionMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: false,
      default: null,
      index: true,
      trim: true,
      description: 'Message ID of the role selection embed',
    },
    messageType: {
      type: String,
      required: true,
      trim: true,
      description: 'Category type (e.g., troop, spender, gender, etc.)',
    },
    channelId: {
      type: String,
      required: false,
      default: null,
      trim: true,
      description: 'Channel ID where the role selection message is posted',
    },
    guildId: {
      type: String,
      required: true,
      trim: true,
      description: 'Guild/server ID',
    },
    roles: [
      {
        emoji: {
          type: String,
          required: true,
          trim: true,
          description: 'Emoji tied to the role (e.g., 🦁)',
        },
        roleName: {
          type: String,
          required: true,
          trim: true,
          description: 'Display name of the role (e.g., Africa)',
        },
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
      description: 'Description shown in the embed for this role category',
    },
  },
  {
    timestamps: true,
    collection: 'roleReactionMessages',
  }
);

// Prevent duplicate category configs in the same guild
RoleReactionMessageSchema.index({ guildId: 1, messageType: 1 }, { unique: true });

module.exports = mongoose.model(
  'RoleReactionMessage',
  RoleReactionMessageSchema
);

