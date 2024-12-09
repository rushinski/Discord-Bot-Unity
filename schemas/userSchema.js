const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: { type: Number, default: 0 },
  level: { type: String, default: "Lurking Loser" }, // Default to the first level
});

module.exports = mongoose.model('User', userSchema);