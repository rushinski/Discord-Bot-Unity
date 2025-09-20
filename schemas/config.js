const { Schema, model } = require('mongoose');

/**
 * GuildConfig Schema
 * ----------------------------------------
 * Stores per-guild configuration for log channels,
 * ticket system roles, and dynamic ticket prompts.
 */
const guildConfigSchema = new Schema(
  {
    guildId: { type: String, required: true, unique: true },

    // Log Channels
    moderationLogChannel: { type: String, default: null },
    ticketTranscriptsChannel: { type: String, default: null },
    createdTicketCategory: { type: String, default: null },
    joinLeaveLogChannel: { type: String, default: null },
    welcomeChannel: { type: String, default: null },
    levelUpLogChannel: { type: String, default: null },
    utcTimeChannel: { type: String, default: null },
    utcDateChannel: { type: String, default: null },

    // Ticket System Roles
    generalSupportRoleId: { type: String, default: null },
    verificationRoleId: { type: String, default: null },

    // Dynamic Ticket Types (for dropdown menu)
    ticketTypes: {
      type: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
          description: { type: String, default: '' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('GuildConfig', guildConfigSchema);
