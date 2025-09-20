/**
 * File: events/readyUTC.js
 * Purpose: Handles updating guild channels to display the current UTC time and date.
 *
 * Responsibilities:
 * - Update the configured time channel every 10 minutes (aligned to the clock).
 * - Update the configured date channel daily at UTC midnight.
 * - Fetch channel IDs from the guild configuration schema.
 * - Handle errors gracefully if channels are missing or updates fail.
 *
 * Notes for Recruiters:
 * This event ensures that designated voice channels act as live clocks,
 * displaying the current UTC time and date. It demonstrates scheduled,
 * automated updates tied to global timekeeping.
 */

const { Events } = require('discord.js');
const Config = require('../schemas/config');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log('[UTCUpdater] Initialized.');

    try {
      const configData = await Config.findOne();
      if (!configData?.utcTimeChannel || !configData?.utcDateChannel) {
        console.warn('[UTCUpdater] Channel IDs not configured in database.');
        return;
      }

      const timeChannelId = configData.utcTimeChannel;
      const dateChannelId = configData.utcDateChannel;

      // Update the time channel (HH:MM, rounded to nearest 10 minutes)
      async function updateTimeChannel() {
        try {
          const channel = client.channels.cache.get(timeChannelId);
          if (!channel) return;

          const now = new Date();
          const hours = now.getUTCHours().toString().padStart(2, '0');
          const minutes = (Math.floor(now.getUTCMinutes() / 10) * 10)
            .toString()
            .padStart(2, '0');

          const newName = `UTC Time: ${hours}:${minutes}`;
          if (channel.name !== newName) {
            await channel.setName(newName);
          }
        } catch (error) {
          console.error('[UTCUpdater] Failed to update time channel:', error);
        }
      }

      // Update the date channel (DD/MM)
      async function updateDateChannel() {
        try {
          const channel = client.channels.cache.get(dateChannelId);
          if (!channel) return;

          const now = new Date();
          const day = now.getUTCDate().toString().padStart(2, '0');
          const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');

          const newName = `UTC Date: ${day}/${month}`;
          if (channel.name !== newName) {
            await channel.setName(newName);
          }
        } catch (error) {
          console.error('[UTCUpdater] Failed to update date channel:', error);
        }
      }

      // Schedule midnight date updates
      function scheduleMidnightUpdate() {
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setUTCHours(24, 0, 0, 0);
        const timeUntilMidnight = nextMidnight - now;

        setTimeout(async () => {
          await updateDateChannel();
          scheduleMidnightUpdate();
        }, timeUntilMidnight);
      }

      // Schedule aligned time updates every 10 minutes
      function scheduleAlignedTimeUpdate() {
        const now = new Date();
        const currentMinutes = now.getUTCMinutes();
        const nextAlignedMinutes = Math.ceil(currentMinutes / 10) * 10;
        const delay =
          (nextAlignedMinutes - currentMinutes) * 60 * 1000 - now.getUTCSeconds() * 1000;

        setTimeout(async () => {
          await updateTimeChannel();
          setInterval(updateTimeChannel, 10 * 60 * 1000);
        }, delay);
      }

      // Perform initial updates
      await updateTimeChannel();
      await updateDateChannel();

      // Schedule recurring updates
      scheduleAlignedTimeUpdate();
      scheduleMidnightUpdate();
    } catch (error) {
      console.error('[UTCUpdater] Initialization error:', error);
    }
  },
};
