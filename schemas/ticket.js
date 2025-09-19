const { Schema, model } = require('mongoose');

/**
 * Ticket Schema
 * ----------------------------------------
 * Represents an individual support or verification ticket.
 * Tracks user, channel, type, and lifecycle status.
 */
const ticketSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true, index: true },
    ticketType: { type: String, required: true }, // "verification", "complaints", etc.
    description: { type: String, default: null },

    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Compound index for quick lookups by user/guild/status
ticketSchema.index({ userId: 1, guildId: 1, status: 1 });

module.exports = model('Ticket', ticketSchema);
