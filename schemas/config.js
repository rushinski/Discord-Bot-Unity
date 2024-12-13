const { Schema, model } = require('mongoose');

const guildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  moderationLogChannel: { type: String, default: null }, // Channel for moderation logs
  ticketTranscriptsChannel: { type: String, default: null }, // Channel for ticket transcripts
  createdTicketCategory: { type: String, default: null }, // Category for created tickets
  leaveLogChannel: { type: String, default: null }, // Channel for leave logs
  welcomeChannel: { type: String, default: null }, // Channel for welcome messages
});

module.exports = model('GuildConfig', guildConfigSchema);
