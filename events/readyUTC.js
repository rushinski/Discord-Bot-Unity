/**
 * Event: ClientReady → UTC Updater
 * ----------------------------------------
 * Purpose:
 * - Updates configured voice channels to display current UTC time and date.
 *
 * Behavior:
 * - Time channel updates every 10 minutes, aligned to the clock.
 * - Date channel updates daily at UTC midnight.
 * - Logs errors to console if channels cannot be found.
 *
 * Dependencies:
 * - schemas/config.js (should contain IDs for time and date channels)
 *
 * Notes:
 * - Channel names kept simple and recruiter-ready.
 * - Replace placeholder IDs with values from guild configuration or env.
 */

const { Events } = require('discord.js');
const Config = require('../schemas/config');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log('✅ UTC updater initialized.');

    try {
      // Fetch guild config (replace with your server's config lookup logic)
      const configData = await Config.findOne();
      if (!configData?.utcTimeChannel || !configData?.utcDateChannel) {
        console.warn('UTC updater: Channel IDs not configured.');
        return;
      }

      const timeChannelId = configData.utcTimeChannel;
      const dateChannelId = configData.utcDateChannel;

      // Function to update time channel
      async function updateTimeChannel() {
        try {
          const channel = client.channels.cache.get(timeChannelId);
          if (!channel) return;

          const now = new Date();
          const hours = now.getUTCHours().toString().padStart(2, '0');
          const minutes = (Math.floor(now.getUTCMinutes() / 10) * 10)
            .toString()
            .padStart(2, '0');

          const newName = `🕒 UTC Time: ${hours}:${minutes}`;
          if (channel.name !== newName) await channel.setName(newName);
        } catch (error) {
          console.error('Failed to update time channel:', error);
        }
      }

      // Function to update date channel
      async function updateDateChannel() {
        try {
          const channel = client.channels.cache.get(dateChannelId);
          if (!channel) return;

          const now = new Date();
          const day = now.getUTCDate().toString().padStart(2, '0');
          const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');

          const newName = `📅 UTC Date: ${day}/${month}`;
          if (channel.name !== newName) await channel.setName(newName);
        } catch (error) {
          console.error('Failed to update date channel:', error);
        }
      }

      // Schedule midnight date update
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

      // Schedule aligned time update every 10 minutes
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

      // Initial updates
      await updateTimeChannel();
      await updateDateChannel();

      // Schedule recurring updates
      scheduleAlignedTimeUpdate();
      scheduleMidnightUpdate();
    } catch (error) {
      console.error('Error initializing UTC updater:', error);
    }
  },
};
