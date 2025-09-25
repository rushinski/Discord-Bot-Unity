/**
 * File: getUtc.js
 * Command: /get-utc
 *
 * Purpose:
 * Convert a user-specified local time and timezone into its UTC equivalent.
 *
 * Responsibilities:
 * - Accept a timezone, time, and optional date from the user.
 * - Validate inputs and ensure correct formatting.
 * - Calculate UTC time from the given local time and timezone.
 * - Provide results in a clear and professional response.
 *
 * Recruiter Notes:
 * This command demonstrates careful handling of timezones and user input validation.
 * All responses are designed to be professional and easy to interpret.
 */

const { SlashCommandBuilder } = require('discord.js');
const { format } = require('date-fns');
const { getTimezoneOffset } = require('date-fns-tz');

/**
 * Convert a local date string into its UTC equivalent for a given timezone.
 * @param {string} localDateString - Combined date and time in ISO-like format (YYYY-MM-DDTHH:mm:ss).
 * @param {string} timezone - A valid IANA timezone identifier (e.g., "America/New_York").
 * @returns {Date} UTC Date object
 */
function convertToUtc(localDateString, timezone) {
  const localDate = new Date(localDateString);
  if (isNaN(localDate)) throw new Error('Invalid date provided.');

  // `getTimezoneOffset` returns the difference between UTC and the target timezone in milliseconds.
  // Subtracting this offset from the local time produces the equivalent UTC time.
  const offset = getTimezoneOffset(timezone, localDate);
  return new Date(localDate.getTime() - offset);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-utc')
    .setDescription('Convert a local time (with timezone) to UTC')
    .addStringOption(option =>
      option
        .setName('timezone')
        .setDescription('Timezone identifier to use for conversion')
        .setRequired(true)
        // Limited list of timezones is provided because Discord restricts choices to 25 items.
        .addChoices(
          { name: 'New York (EST/EDT)', value: 'America/New_York' },
          { name: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
          { name: 'Chicago (CST/CDT)', value: 'America/Chicago' },
          { name: 'Mexico City (CST/CDT)', value: 'America/Mexico_City' },
          { name: 'Sao Paulo (BRT)', value: 'America/Sao_Paulo' },
          { name: 'London (GMT/BST)', value: 'Europe/London' },
          { name: 'Berlin (CET/CEST)', value: 'Europe/Berlin' },
          { name: 'Paris (CET/CEST)', value: 'Europe/Paris' },
          { name: 'Moscow (MSK)', value: 'Europe/Moscow' },
          { name: 'Dubai (GST)', value: 'Asia/Dubai' },
          { name: 'Kolkata (IST)', value: 'Asia/Kolkata' },
          { name: 'Singapore (SGT)', value: 'Asia/Singapore' },
          { name: 'Tokyo (JST)', value: 'Asia/Tokyo' },
          { name: 'Cairo (EET)', value: 'Africa/Cairo' },
          { name: 'Johannesburg (SAST)', value: 'Africa/Johannesburg' },
          { name: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
          { name: 'Auckland (NZST/NZDT)', value: 'Pacific/Auckland' }
        )
    )
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('Local time in HH:mm (24-hour format)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('Date in YYYY-MM-DD (defaults to today)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const timezone = interaction.options.getString('timezone');
    const time = interaction.options.getString('time');
    const date = interaction.options.getString('date') || format(new Date(), 'yyyy-MM-dd');

    try {
      // Combine the provided date and time into a single string that can be parsed as a Date.
      const localDateTime = `${date}T${time}:00`;

      // Validate that the combined string produces a valid Date object.
      if (isNaN(new Date(localDateTime).getTime())) {
        return interaction.reply({
          content: 'Invalid date or time. Please use format: YYYY-MM-DD HH:mm (24-hour).',
          flags: 64, // Response is ephemeral (only visible to the user who ran the command).
        });
      }

      // Perform the actual conversion from the given timezone to UTC.
      const utcDate = convertToUtc(localDateTime, timezone);

      // Format the resulting UTC Date into a clean, readable string.
      const utcFormatted = format(utcDate, "yyyy-MM-dd HH:mm:ss 'UTC'");

      return interaction.reply({
        content: `UTC time for **${time}** in **${timezone}** on **${date}** is:\n${utcFormatted}`,
        flags: 64,
      });
    } catch (error) {
      console.error('[getUtc] Error executing command:', error);
      return interaction.reply({
        content: 'An error occurred while converting time. Please verify your input and try again.',
        flags: 64,
      });
    }
  },
};
