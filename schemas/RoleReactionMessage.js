const mongoose = require('mongoose');

const RoleReactionMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: false, default: null }, // was required: true
  messageType: { type: String, required: true }, // e.g., 'troop', 'spender', etc.
  channelId: { type: String, required: false, default: null }, // also optional until send-role-select runs
  guildId: { type: String, required: true },
  roles: [
    {
      emoji: { type: String, required: true },   // e.g., "🦁"
      roleName: { type: String, required: true } // e.g., "Africa"
    }
  ],
  description: { type: String, required: true }
});

module.exports = mongoose.model('RoleReactionMessage', RoleReactionMessageSchema);
