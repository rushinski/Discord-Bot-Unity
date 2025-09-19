const mongoose = require('mongoose');

const RoleCountConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  channelId: { type: String, required: true },
  label: { type: String, required: true },
  emoji: { type: String, required: false, default: '' }, // optional
});

module.exports = mongoose.model('RoleCountConfig', RoleCountConfigSchema);
