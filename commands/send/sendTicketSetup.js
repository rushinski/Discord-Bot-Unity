/**
 * File: commands/send/sendTicketSetup.js
 * Purpose: Sends the ticket system setup embed and dropdown menu.
 *
 * Notes:
 * - Ticket options are dynamically loaded from the GuildConfig schema.
 * - If no ticket types are configured, the command responds with guidance for setup.
 * - Output is professional and recruiter-readable (no informal emojis).
 */

const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/config');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-ticket-setup')
    .setDescription('Send the ticket system setup embed and dropdown menu.'),

  async execute(interaction) {
    try {
      // Retrieve guild configuration from the database
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

      // Ensure ticket types are configured before proceeding
      if (!config || !config.ticketTypes || config.ticketTypes.length === 0) {
        return interaction.reply({
          content: 'No ticket types are configured. Use `/configure-ticket-system` with the `ticket-type add` option to define them before running this command.',
          flags: 64,
        });
      }

      // Construct embed for ticket system setup
      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Ticket Support')
        .setDescription(
          'Select the type of ticket you would like to open from the dropdown menu below.\n\n' +
          'Our support team will review your request and respond as soon as possible.'
        )
        .setFooter({ text: `${interaction.guild.name} • Ticket System` })
        .setTimestamp();

      // Build select menu dynamically from configured ticket types
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

      // Send the setup message publicly in the channel
      await interaction.reply({
        embeds: [ticketEmbed],
        components: [row],
      });

      console.log(`[TicketSystem] 📦 Ticket setup message dispatched in guild ${interaction.guild.id}`);
    } catch (error) {
      console.error('[TicketSystem] ❌ Error sending ticket setup message:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while sending the ticket setup message. Please try again later.',
          flags: 64,
        });
      }
    }
  },
};
