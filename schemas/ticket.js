const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  ticketType: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'open' }, // Add this field with a default value of 'open'
});

module.exports = mongoose.model('Ticket', ticketSchema);
