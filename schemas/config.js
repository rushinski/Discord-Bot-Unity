const { Schema, model } = require('mongoose');

const messageLogSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true }
});

// Export the model directly, without destructuring
module.exports = model('MessageLogChannel', messageLogSchema);
