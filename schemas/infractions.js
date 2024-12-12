const mongoose = require('mongoose');

const infractionsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  strikes: { type: Number, default: 0 },
});

module.exports = mongoose.model('Infractions', infractionsSchema);
