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
  createdAt: { type: Date, default: Date.now }, // Automatically records the creation time
  updatedAt: { type: Date, default: Date.now }, // Automatically updates on modification
});

ticketTranscriptSchema.pre('save', function (next) {
  this.updatedAt = Date.now(); // Updates the `updatedAt` field before saving
  next();
});

module.exports = mongoose.model('TicketTranscript', ticketTranscriptSchema);
