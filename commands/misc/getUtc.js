/**
 * Slash Command: /get-utc
 * ----------------------------------------
 * Converts a provided local time (and optional date)
 * into its equivalent UTC time, based on a chosen timezone.
 *
 * Example:
 *   /get-utc timezone:America/New_York time:14:30 date:2025-09-18
 *
 * Notes:
 * - Time must be in 24h format (HH:mm).
 * - Date defaults to today's date if not provided.
 * - Dropdown limited to <=25 timezones (Discord API constraint).
 */

const { SlashCommandBuilder } = require('discord.js');
const { format } = require('date-fns');
const { getTimezoneOffset } = require('date-fns-tz');

function convertToUtc(localDateString, timezone) {
  const localDate = new Date(localDateString);
  if (isNaN(localDate)) throw new Error("Invalid date");

  const offset = getTimezoneOffset(timezone, localDate); // in ms
  return new Date(localDate.getTime() - offset);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-utc')
    .setDescription('Convert a local time (with timezone) to UTC')
    .addStringOption(option =>
      option
        .setName('timezone')
        .setDescription('Select your timezone')
        .setRequired(true)
        .addChoices(
          // 🌎 Americas
          { name: 'New York (EST/EDT)', value: 'America/New_York' },
          { name: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
          { name: 'Chicago (CST/CDT)', value: 'America/Chicago' },
          { name: 'Mexico City (CST/CDT)', value: 'America/Mexico_City' },
          { name: 'Sao Paulo (BRT)', value: 'America/Sao_Paulo' },

          // 🌍 Europe
          { name: 'London (GMT/BST)', value: 'Europe/London' },
          { name: 'Berlin (CET/CEST)', value: 'Europe/Berlin' },
          { name: 'Paris (CET/CEST)', value: 'Europe/Paris' },
          { name: 'Moscow (MSK)', value: 'Europe/Moscow' },

          // 🌏 Asia
          { name: 'Dubai (GST)', value: 'Asia/Dubai' },
          { name: 'Kolkata (IST)', value: 'Asia/Kolkata' },
          { name: 'Singapore (SGT)', value: 'Asia/Singapore' },
          { name: 'Tokyo (JST)', value: 'Asia/Tokyo' },

          // 🌍 Africa
          { name: 'Cairo (EET)', value: 'Africa/Cairo' },
          { name: 'Johannesburg (SAST)', value: 'Africa/Johannesburg' },

          // 🌏 Oceania
          { name: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
          { name: 'Auckland (NZST/NZDT)', value: 'Pacific/Auckland' }
        ),
    )
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('Local time in HH:mm (24h format)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('Date in YYYY-MM-DD (defaults to today)')
        .setRequired(false),
    ),

  async execute(interaction) {
    const timezone = interaction.options.getString('timezone');
    const time = interaction.options.getString('time');
    const date = interaction.options.getString('date') || format(new Date(), 'yyyy-MM-dd');

    try {
      const localDateTime = `${date}T${time}:00`;

      if (isNaN(new Date(localDateTime).getTime())) {
        return interaction.reply({
          content: '⚠️ Invalid date or time. Please check your input format (YYYY-MM-DD HH:mm).',
          flags: 64, // ephemeral
        });
      }

      // Convert local time in chosen timezone → UTC
      const utcDate = convertToUtc(localDateTime, timezone);
      const utcFormatted = format(utcDate, "yyyy-MM-dd HH:mm:ss 'UTC'");

      return interaction.reply({
        content: `🕒 UTC time for **${time}** in **${timezone}** on **${date}**:\n➡️ **${utcFormatted}**`,
        flags: 64, // ephemeral reply
      });
    } catch (error) {
      console.error('Error in /get-utc:', error);
      return interaction.reply({
        content: '❌ An error occurred while converting time. Please check your input and try again.',
        flags: 64, // ephemeral
      });
    }
  },
};
