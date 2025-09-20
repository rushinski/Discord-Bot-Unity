/**
 * File: schemas/ticket.js
 * Purpose: Defines the schema for storing individual support or verification tickets.
 *
 * Responsibilities:
 * - Store references to the user, channel, and guild associated with a ticket.
 * - Track the type of ticket (e.g., verification, complaints, general support).
 * - Maintain the lifecycle state of the ticket (open, closed, pending).
 * - Provide indexes for efficient lookups when querying by user, guild, or status.
 *
 * Notes for Recruiters:
 * This schema represents a single ticket created by a user.
 * Tickets can be general support requests or specialized types like verification.
 * Each ticket corresponds to a dedicated private channel in the guild.
 */

const { Schema, model } = require('mongoose');

const ticketSchema = new Schema(
  {
    userId: { type: String, required: true, index: true }, // Discord user ID of the ticket creator
    channelId: { type: String, required: true, unique: true }, // Discord channel ID of the ticket channel
    guildId: { type: String, required: true, index: true }, // Discord guild ID where the ticket was created
    ticketType: { type: String, required: true }, // Ticket type (e.g., "verification", "complaints", "support")
    description: { type: String, default: null }, // Optional description provided by the user during ticket creation

    // Current status of the ticket lifecycle
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    },
  },
  { timestamps: true }
);

ticketSchema.index({ userId: 1, guildId: 1, status: 1 }); // Compound index for efficient lookups by user, guild, and status

module.exports = model('Ticket', ticketSchema);
