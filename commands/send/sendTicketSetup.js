/**
 * File: commands/send/sendTicketSetup.js
 * Purpose: Sends the ticket system setup embed and dropdown menu.
 *
 * Responsibilities:
 * - Retrieve configured ticket types from the database.
 * - Build and display a professional embed with a dropdown selector.
 * - Provide users with a structured entry point for creating tickets.
 *
 * Notes for Recruiters:
 * This command allows administrators to post the ticket system panel into a channel.
 * Users interact with the dropdown to begin the ticket creation process.
 * The available ticket types are fully configurable by administrators.
 */

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('send-ticket-setup')
    .setDescription('Send the ticket system setup embed and dropdown menu.'),

  /**
   * Executes the send-ticket-setup command.
   * @param {object} interaction - Discord command interaction.
   */
  async execute(interaction) {
    try {
      // Load guild-specific configuration
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

      // Ensure ticket types are available before proceeding
      if (!config || !config.ticketTypes || config.ticketTypes.length === 0) {
        return interaction.reply({
          content:
            'No ticket types are configured. Use `/configure-ticket-system` with the `ticket-type add` option to define them before running this command.',
          flags: 64,
        });
      }

      // Construct the ticket system embed
      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Ticket Support')
        .setDescription(
          'Select the type of ticket you would like to open from the dropdown menu below.\n\n' +
          'Our support team will review your request and respond as soon as possible.'
        )
        .setFooter({ text: `${interaction.guild.name} • Ticket System` })
        .setTimestamp();

      // Build dropdown menu from configured ticket types
      const ticketSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticketType')
        .setPlaceholder('Select a ticket type')
        .addOptions(
          config.ticketTypes.map(type => ({
            label: type.label,
            value: type.value,
            description: type.description || 'No description provided.',
          }))
        );

      const row = new ActionRowBuilder().addComponents(ticketSelectMenu);

      // Send the embed with dropdown menu to the current channel
      await interaction.reply({
        embeds: [ticketEmbed],
        components: [row],
      });

      console.log(`[TicketSystem] Ticket setup message sent in guild ${interaction.guild.id}`);
    } catch (error) {
      console.error('[TicketSystem] Error sending ticket setup message:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content:
            'An error occurred while sending the ticket setup message. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
