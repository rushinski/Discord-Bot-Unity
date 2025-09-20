/**
 * Schema: User
 * Purpose: Define user-level persistence for the leveling system.
 *
 * Fields:
 * - userId: Discord user identifier (unique).
 * - messages: Total number of messages sent by the user in tracked guilds.
 * - level: The user's current assigned level (string label).
 * - notificationsEnabled: Whether the user receives direct notifications for level changes.
 *
 * Notes for Recruiters:
 * This schema underpins the leveling system by persisting user activity and progression.
 * It ensures that message counts and level states are stored consistently across sessions.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: { type: Number, default: 0 },
  level: { type: String, default: 'Newcomer' }, // Neutral professional default
  notificationsEnabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);
