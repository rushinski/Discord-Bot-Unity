/**
 * File: schemas/userSchema.js
 * Purpose: Defines the schema for persisting user activity and progression in the leveling system.
 *
 * Responsibilities:
 * - Track the total number of messages sent by each user.
 * - Store the user's current level designation.
 * - Control whether users receive direct notifications on level changes.
 *
 * Notes for Recruiters:
 * This schema underpins the leveling feature by recording user activity
 * across sessions. It ensures consistent storage of progression data,
 * allowing fair and persistent recognition of engagement.
 */

const { Schema, model, models } = require('mongoose');

const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true }, // Discord user ID
    messages: { type: Number, default: 0 }, // Count of tracked messages
    level: { type: String, default: 'Newcomer' }, // User's current level label
    notificationsEnabled: { type: Boolean, default: true }, // Whether to notify user on level changes
  },
  { timestamps: true, collection: 'users' }
);

module.exports = models.User || model('User', userSchema);
