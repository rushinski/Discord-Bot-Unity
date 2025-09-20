/**
 * File: schemas/ticket.js
 * Purpose: Defines the schema for storing individual support and verification tickets.
 *
 * Responsibilities:
 * - Store references to the user, channel, and guild associated with each ticket.
 * - Track ticket type (e.g., verification, complaints, general support).
 * - Manage ticket lifecycle status (open, closed, pending).
 * - Provide indexes for efficient lookups across users, guilds, and statuses.
 *
 * Notes for Recruiters:
 * Each ticket corresponds to a private support channel within the guild.
 * This schema ensures tickets are tracked consistently, supporting
 * moderation workflows and user support processes.
 */

const { Schema, model, models } = require('mongoose');

const ticketSchema = new Schema(
  {
    userId: { type: String, required: true, index: true }, // Discord user ID of the ticket creator
    channelId: { type: String, required: true, unique: true }, // Dedicated channel ID for the ticket
    guildId: { type: String, required: true, index: true }, // Discord guild ID where the ticket belongs
    ticketType: { type: String, required: true }, // Ticket category (e.g., "verification", "support")
    description: { type: String, default: null }, // Optional user-provided description

    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    }, // Current lifecycle state of the ticket
  },
  { timestamps: true, collection: 'tickets' }
);

// Compound index for fast queries across user, guild, and status
ticketSchema.index({ userId: 1, guildId: 1, status: 1 });

module.exports = models.Ticket || model('Ticket', ticketSchema);
