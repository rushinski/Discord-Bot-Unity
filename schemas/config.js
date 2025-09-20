/**
 * File: schemas/config.js
 * Purpose: Defines the schema for storing per-guild configuration settings.
 *
 * Responsibilities:
 * - Store references to guild-specific channels (moderation, tickets, join/leave, welcome, leveling, UTC tracking).
 * - Store ticket system configuration (roles, category, transcript channel).
 * - Manage dynamic ticket types for the ticket system dropdown menu.
 * - Provide timestamps for configuration changes.
 *
 * Notes for Recruiters:
 * This schema is the central configuration record for each guild (Discord server).
 * It ensures that system features such as moderation logs, ticket systems,
 * welcome messages, and leveling are properly mapped to the correct channels and roles.
 */

const { Schema, model } = require('mongoose');

const guildConfigSchema = new Schema(
  {
    // Discord guild ID this configuration belongs to
    guildId: { type: String, required: true, unique: true },

    /**
     * Logging and Channel Configuration
     */
    moderationLogChannel: { type: String, default: null }, // Logs for moderation actions (e.g., bans, strikes)
    ticketTranscriptsChannel: { type: String, default: null }, // Where ticket transcripts are posted
    createdTicketCategory: { type: String, default: null }, // Category for creating new tickets
    joinLeaveLogChannel: { type: String, default: null }, // Logs when users join or leave the guild
    welcomeChannel: { type: String, default: null }, // Channel where welcome messages are sent
    levelUpLogChannel: { type: String, default: null }, // Logs when users level up (XP system)
    utcTimeChannel: { type: String, default: null }, // Channel for UTC time updates
    utcDateChannel: { type: String, default: null }, // Channel for UTC date updates

    /**
     * Ticket System Roles
     */
    generalSupportRoleId: { type: String, default: null }, // Role notified for general support tickets
    verificationRoleId: { type: String, default: null }, // Role granted upon successful verification

    /**
     * Dynamic Ticket Types
     * These define the selectable ticket types available in the ticket system panel.
     */
    ticketTypes: {
      type: [
        {
          label: { type: String, required: true }, // Display name for the ticket type
          value: { type: String, required: true }, // Internal identifier for the ticket type
          description: { type: String, default: '' }, // Optional description shown in the dropdown
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('GuildConfig', guildConfigSchema);
