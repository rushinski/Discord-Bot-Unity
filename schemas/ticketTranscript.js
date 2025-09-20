/**
 * File: schemas/ticketTranscript.js
 * Purpose: Defines the schema for storing archived transcripts of closed tickets.
 *
 * Responsibilities:
 * - Persist transcripts of ticket conversations for record-keeping.
 * - Reference the related ticket document in the database.
 * - Store transcripts as GitHub Gist links when possible, or inline message data as a fallback.
 * - Enable staff to review historical tickets for accountability.
 *
 * Notes for Recruiters:
 * This schema ensures closed tickets are archived in a reviewable format.
 * If an external transcript upload (e.g., GitHub Gist) is successful,
 * the transcript is stored as a link. If not, messages are stored
 * inline to guarantee records are never lost.
 */

const { Schema, model, models } = require('mongoose');

const ticketTranscriptSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true }, // Reference to related Ticket
    gistUrl: { type: String, default: null }, // External transcript link (preferred)

    messages: [
      {
        author: { type: String, required: true }, // User who sent the message
        content: { type: String, required: true }, // Message content
        timestamp: { type: Date, required: true }, // When the message was sent
      },
    ], // Inline fallback transcript storage
  },
  { timestamps: true, collection: 'ticketTranscripts' }
);

module.exports =
  models.TicketTranscript || model('TicketTranscript', ticketTranscriptSchema);
