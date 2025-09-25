/**
 * File: schemas/config.js
 * Purpose: Defines the schema for storing per-guild configuration settings.
 *
 * Responsibilities:
 * - Store references to guild-specific channels for logging, tickets, welcome, leveling, and UTC tracking.
 * - Manage ticket system roles and dynamic ticket types for the ticket dropdown menu.
 * - Track configuration state with timestamps for auditing.
 *
 * Notes for Recruiters:
 * This schema acts as the central configuration record for each guild.
 * It ensures that features such as moderation logs, ticket systems,
 * welcome messages, and leveling are properly mapped to the correct
 * channels and roles. The design enforces consistency while supporting
 * feature growth across different guilds.
 */

const { Schema, model, models } = require('mongoose');

const guildConfigSchema = new Schema(
  {
    guildId: { type: String, required: true, unique: true }, // Discord guild ID this configuration belongs to

    // Logging and Channel Configuration
    moderationLogChannel: { type: String, default: null }, // Channel for moderation action logs (bans, strikes, etc.)
    ticketTranscriptsChannel: { type: String, default: null }, // Channel where ticket transcripts are posted
    createdTicketCategory: { type: String, default: null }, // Category under which new tickets are created
    joinLeaveLogChannel: { type: String, default: null }, // Channel logging when users join or leave
    welcomeChannel: { type: String, default: null }, // Channel for welcome messages
    levelUpLogChannel: { type: String, default: null }, // Channel logging level-up events
    utcTimeChannel: { type: String, default: null }, // Channel showing UTC time
    utcDateChannel: { type: String, default: null }, // Channel showing UTC date

    // Ticket System Roles
    generalSupportRoleId: { type: String, default: null }, // Role notified for general support tickets
    verificationRoleId: { type: String, default: null }, // Role granted upon successful verification

    // Dynamic Ticket Types (used in dropdown menu)
    ticketTypes: {
      type: [
        {
          label: { type: String, required: true }, // Display name for the ticket type
          value: { type: String, required: true }, // Internal identifier for the ticket type
          description: { type: String, default: '' }, // Optional description for dropdown display
        },
      ],
      default: [],
    },
  },
  { timestamps: true, collection: 'guildConfigs' }
);

module.exports = models.GuildConfig || model('GuildConfig', guildConfigSchema);
