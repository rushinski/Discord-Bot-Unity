const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  prize: { type: String, required: true },
  winnersCount: { type: Number, required: true },
  endDate: { type: Date, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true }
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
