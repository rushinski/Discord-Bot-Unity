/**
 * File: events/ticketSystemHandler.js
 * Purpose: Handles dropdown selections, modal submissions, and pingSupport button interactions.
 */

const { Events } = require("discord.js");
const GuildConfig = require("../schemas/config");
const Ticket = require("../schemas/ticket");
const createTicket = require("../utils/createTicket");

const pingCooldown = new Map();

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    try {
      // Handle dropdown selection → show modal
      if (interaction.isStringSelectMenu() && interaction.customId === "ticketType") {
        interaction.client.userTicketSelections ??= new Map();
        interaction.client.userTicketSelections.set(
          interaction.user.id,
          interaction.values[0]
        );
        return await createTicket.showDescriptionModal(interaction);
      }

      // Handle modal submission → create ticket
      if (interaction.isModalSubmit() && interaction.customId === "ticketDescriptionModal") {
        const ticketType = interaction.client.userTicketSelections?.get(interaction.user.id);
        const description = interaction.fields.getTextInputValue("ticketDescription");

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!guildConfig || !guildConfig.createdTicketCategory) {
          return interaction.reply({
            content:
              "The ticket system is not configured. Please set a ticket category using `/configure`.",
            flags: 64,
          });
        }

        const existingTicket = await Ticket.findOne({
          userId: interaction.user.id,
          guildId: interaction.guild.id,
          status: { $ne: "closed" },
        });
        if (existingTicket) {
          return interaction.reply({
            content:
              "You already have an open ticket. Please close it before creating a new one.",
            flags: 64,
          });
        }

        return await createTicket.create(interaction, ticketType, description, guildConfig);
      }

      // Handle support ping button
      if (interaction.isButton() && interaction.customId === "pingSupport") {
        const ticketData = await Ticket.findOne({ channelId: interaction.channel.id });
        if (!ticketData) {
          return interaction.reply({
            content: "No open ticket is associated with this channel.",
            flags: 64,
          });
        }

        const now = Date.now();
        const lastPing = pingCooldown.get(interaction.channel.id) || ticketData.createdAt;
        const timeDifference = now - lastPing;

        const cooldownMs = 15 * 60 * 1000; // 15 minutes
        if (timeDifference < cooldownMs) {
          const remainingMinutes = Math.ceil((cooldownMs - timeDifference) / 60000);
          return interaction.reply({
            content: `You must wait ${remainingMinutes} minutes before pinging support again.`,
            flags: 64,
          });
        }

        pingCooldown.set(interaction.channel.id, now);

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const supportRoleId = guildConfig.generalSupportRoleId;

        if (!supportRoleId) {
          return interaction.reply({
            content: "Support role is not configured. Please contact an administrator.",
            flags: 64,
          });
        }

        await interaction.reply({ content: "Support team has been notified.", flags: 64 });
        await interaction.channel.send({ content: `<@&${supportRoleId}>` });

        console.log(`[TicketSystem] 🔔 Support pinged in ticket ${interaction.channel.id}`);
      }
    } catch (error) {
      console.error("[TicketSystem] ❌ Error in ticketSystemHandler:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "An error occurred while processing your request. Please try again later.",
          flags: 64,
        });
      }
    }
  },
};
