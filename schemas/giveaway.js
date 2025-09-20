/**
 * File: schemas/giveaway.js
 * Purpose: Defines the schema for managing giveaways hosted in a Discord guild.
 *
 * Responsibilities:
 * - Store giveaway details such as title, prize, and number of winners.
 * - Track the end date and time for automatic resolution.
 * - Link the giveaway to the channel and message used for participation.
 *
 * Notes for Recruiters:
 * This schema powers the giveaway feature, enabling scheduled prize draws
 * in a Discord server. Each record corresponds to a giveaway event,
 * ensuring clear tracking of timing, winners, and presentation.
 */

const { Schema, model, models } = require('mongoose');

const giveawaySchema = new Schema(
  {
    title: { type: String, required: true }, // Title of the giveaway (e.g., "Holiday Raffle")
    prize: { type: String, required: true }, // Description of the prize (e.g., "Discord Nitro")
    winnersCount: { type: Number, required: true }, // Number of winners to select
    endDate: { type: Date, required: true }, // Date and time when the giveaway ends
    channelId: { type: String, required: true }, // Channel where the giveaway is hosted
    messageId: { type: String, required: true }, // Discord message ID of the giveaway embed
  },
  { timestamps: true, collection: 'giveaways' }
);

module.exports = models.Giveaway || model('Giveaway', giveawaySchema);
