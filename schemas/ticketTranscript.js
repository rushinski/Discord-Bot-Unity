const mongoose = require('mongoose');

const ticketTranscriptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  ticketType: { type: String, required: true },
  description: { type: String, required: true },
  messages: [
    {
      author: { type: String, required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, required: true },
    },
  ],
});

module.exports = mongoose.model('TicketTranscript', ticketTranscriptSchema);
