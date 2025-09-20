/**
 * File: configureTicketSystem.js
 * Purpose: Slash command to configure ticket system settings for a guild.
 *
 * Responsibilities:
 * - Allow administrators to define ticket categories, support/verification roles,
 *   transcript channels, and custom ticket types.
 * - Validate that the provided IDs are valid channels or roles.
 * - Manage ticket type lifecycle (add, remove, list).
 * - Persist all settings in the GuildConfig schema.
 *
 * Notes for Recruiters:
 * A "ticket system" is a structured support system where users can open private
 * support channels (tickets). This command configures the backend rules for that system.
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('configure-ticket-system')
    .setDescription('Configure the ticket system for this guild.')
    .addStringOption(option =>
      option
        .setName('field')
        .setDescription('Select the field to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Created Ticket Category (Category)', value: 'created-ticket-category' },
          { name: 'Support Role (Role)', value: 'support-role' },
          { name: 'Verification Role (Role)', value: 'verification-role' },
          { name: 'Ticket Transcripts (Text Channel)', value: 'ticket-transcripts' },
          { name: 'Ticket Types (Manage)', value: 'ticket-type' },
        ),
    )
    .addStringOption(option =>
      option
        .setName('value')
        .setDescription('Channel/role ID or ticket-type action (add/remove/list)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Ticket type name (required for add/remove)')
        .setRequired(false),
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Ticket type description (used for add)')
        .setRequired(false),
    ),

  /**
   * Execute the configure-ticket-system command.
   * @param {object} interaction - The Discord interaction instance.
   */
  async execute(interaction) {
    const field = interaction.options.getString('field');
    const value = interaction.options.getString('value');
    const typeName = interaction.options.getString('name');
    const typeDescription = interaction.options.getString('description') || '';

    try {
      // Fetch or initialize guild configuration
      let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) {
        guildConfig = new GuildConfig({ guildId: interaction.guild.id, ticketTypes: [] });
      }

      switch (field) {
        case 'created-ticket-category': {
          const channel = interaction.guild.channels.cache.get(value);
          if (!channel || channel.type !== ChannelType.GuildCategory) {
            return interaction.reply({ content: 'Please provide a valid category channel ID.', flags: 64 });
          }
          guildConfig.createdTicketCategory = value;
          break;
        }

        case 'support-role': {
          if (!interaction.guild.roles.cache.has(value)) {
            return interaction.reply({ content: 'Please provide a valid role ID for the support role.', flags: 64 });
          }
          guildConfig.generalSupportRoleId = value;
          break;
        }

        case 'verification-role': {
          if (!interaction.guild.roles.cache.has(value)) {
            return interaction.reply({ content: 'Please provide a valid role ID for the verification role.', flags: 64 });
          }
          guildConfig.verificationRoleId = value;
          break;
        }

        case 'ticket-transcripts': {
          const channel = interaction.guild.channels.cache.get(value);
          if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please provide a valid text channel ID for ticket transcripts.', flags: 64 });
          }
          guildConfig.ticketTranscriptsChannel = value;
          break;
        }

        case 'ticket-type': {
          const action = value.toLowerCase();

          if (!['add', 'remove', 'list'].includes(action)) {
            return interaction.reply({ content: 'Action must be `add`, `remove`, or `list`.', flags: 64 });
          }

          if (action === 'add') {
            if (!typeName) {
              return interaction.reply({ content: 'Please provide a name for the new ticket type.', flags: 64 });
            }

            const newType = {
              label: typeName,
              value: typeName.toLowerCase().replace(/\s+/g, '-'),
              description: typeDescription || `Support ticket for ${typeName}`,
            };

            const exists = guildConfig.ticketTypes.some(t => t.value === newType.value);
            if (!exists) {
              guildConfig.ticketTypes.push(newType);
            }
          }

          if (action === 'remove') {
            if (!typeName) {
              return interaction.reply({ content: 'Please provide the name of the ticket type to remove.', flags: 64 });
            }

            const typeValue = typeName.toLowerCase().replace(/\s+/g, '-');
            guildConfig.ticketTypes = guildConfig.ticketTypes.filter(t => t.value !== typeValue);
          }

          if (action === 'list') {
            if (guildConfig.ticketTypes.length === 0) {
              return interaction.reply({ content: 'No ticket types configured.', flags: 64 });
            }

            const list = guildConfig.ticketTypes
              .map(t => `• ${t.label} — ${t.description || 'No description'}`)
              .join('\n');

            return interaction.reply({ content: `Configured ticket types:\n${list}`, flags: 64 });
          }
          break;
        }

        default:
          return interaction.reply({ content: 'Invalid configuration field selected.', flags: 64 });
      }

      // Save updated configuration
      await guildConfig.save();

      // Confirm success
      return interaction.reply({
        content: `Configuration updated: **${field.replace(/-/g, ' ')}** set successfully.`,
        flags: 64,
      });
    } catch (error) {
      console.error('[ConfigureTicketSystem] Error while updating ticket system config:', error);
      return interaction.reply({
        content: 'An unexpected error occurred while updating the ticket system configuration.',
        flags: 64,
      });
    }
  },
};
