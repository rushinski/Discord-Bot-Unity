const mongoose = require('mongoose');

const RoleReactionMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  messageType: { type: String, required: true }, // e.g., 'troop', 'spender', 'gender', etc.
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
});

module.exports = mongoose.model('RoleReactionMessage', RoleReactionMessageSchema);
