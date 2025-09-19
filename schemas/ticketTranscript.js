const { Schema, model } = require('mongoose');

/**
 * TicketTranscript Schema
 * ----------------------------------------
 * Stores archived conversation data for a ticket.
 * Primary storage is a Gist URL; inline messages are a fallback.
 */
const ticketTranscriptSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    gistUrl: { type: String, default: null },

    // Fallback storage if Gist upload fails
    messages: {
      type: [
        {
          author: { type: String, required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('TicketTranscript', ticketTranscriptSchema);
