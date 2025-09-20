/**
 * File: schemas/ticketTranscript.js
 * Purpose: Defines the schema for storing ticket transcripts.
 *
 * Responsibilities:
 * - Store the transcript of conversations from a closed ticket.
 * - Reference the related ticket in the database.
 * - Store either a GitHub Gist URL (preferred) or inline message data as fallback.
 * - Preserve accountability and allow staff to review past tickets.
 *
 * Notes for Recruiters:
 * This schema represents the archived record of a ticket.
 * Whenever a ticket is closed, its messages are collected and stored.
 * If possible, transcripts are uploaded to GitHub Gist for easy retrieval.
 * If the upload fails, messages are stored inline in the database.
 */

const { Schema, model } = require('mongoose');

const ticketTranscriptSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true }, // Reference to the related Ticket document
    gistUrl: { type: String, default: null }, // URL of the GitHub Gist where the transcript was uploaded

    // Inline fallback storage if Gist upload fails
    messages: {
      type: [
        {
          author: { type: String, required: true }, // User tag
          content: { type: String, required: true }, // Message content
          timestamp: { type: Date, required: true }, // When the message was sent
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('TicketTranscript', ticketTranscriptSchema);
