/**
 * File: schemas/RoleReactionMessage.js
 * Purpose: Defines the schema for role selection messages using reaction emojis.
 *
 * Responsibilities:
 * - Map a role selection message to its guild and channel.
 * - Define a category type for the message (e.g., troop type, continent, spender).
 * - Store role-emoji associations for interactive role assignment.
 *
 * Notes for Recruiters:
 * This schema powers "reaction role" systems, where users can select roles
 * by clicking on emojis in a designated message embed. It ensures that role
 * categories are clearly defined and prevents duplicate setups per guild.
 */

const { Schema, model, models } = require('mongoose');

const roleReactionMessageSchema = new Schema(
  {
    messageId: { type: String, default: null, index: true }, // Discord message ID of the embed
    messageType: { type: String, required: true }, // Category type (e.g., "continent", "troop", "spender")
    channelId: { type: String, default: null }, // Channel where the message is posted
    guildId: { type: String, required: true }, // Discord guild ID
    roles: [
      {
        emoji: { type: String, required: true }, // Emoji symbol for role selection (e.g., 🦁)
        roleName: { type: String, required: true }, // Human-readable role name (e.g., "Africa")
      },
    ],
    description: { type: String, required: true }, // Text shown in the embed describing this category
  },
  { timestamps: true, collection: 'roleReactionMessages' }
);

// Ensure each guild has unique category types
roleReactionMessageSchema.index({ guildId: 1, messageType: 1 }, { unique: true });

module.exports =
  models.RoleReactionMessage || model('RoleReactionMessage', roleReactionMessageSchema);
