const { Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log('Starting UTC updater...');

    // IDs of the voice channels to update
    const timeChannelId = '1326401321305378850';
    const dateChannelId = '1326401284269539388';

    // Function to update the time channel
    async function updateTimeChannel() {
      try {
        const timeChannel = client.channels.cache.get(timeChannelId);
        if (!timeChannel) {
          console.error('Time channel not found.');
          return;
        }

        const now = new Date();
        const utcHours = now.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = (Math.floor(now.getUTCMinutes() / 10) * 10).toString().padStart(2, '0');
        const timeName = `🕒︱ᴜᴛᴄ ᴛɪᴍᴇ : ${utcHours}:${utcMinutes}`;

        await timeChannel.setName(timeName);
        console.log(`Updated time channel to: ${timeName}`);
      } catch (error) {
        console.error(`Failed to update time channel: ${error.message}`);
      }
    }

    // Function to update the date channel
    async function updateDateChannel() {
      try {
        const dateChannel = client.channels.cache.get(dateChannelId);
        if (!dateChannel) {
          console.error('Date channel not found.');
          return;
        }

        const now = new Date();
        const utcDay = now.getUTCDate().toString().padStart(2, '0'); // Day of the month
        const utcMonth = (now.getUTCMonth() + 1).toString().padStart(2, '0'); // Month (1-based index)
        const dateName = `📅︱ᴜᴛᴄ ᴅᴀᴛᴇ : ${utcDay}/${utcMonth}`;

        await dateChannel.setName(dateName);
        console.log(`Updated date channel to: ${dateName}`);
      } catch (error) {
        console.error(`Failed to update date channel: ${error.message}`);
      }
    }

    // Function to schedule midnight update for the date channel
    function scheduleMidnightUpdate() {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setUTCHours(24, 0, 0, 0); // Set to next midnight
      const timeUntilMidnight = nextMidnight - now;

      setTimeout(async () => {
        await updateDateChannel();
        scheduleMidnightUpdate(); // Reschedule for the next midnight
      }, timeUntilMidnight);
    }

    // Schedule the next aligned time update
    function scheduleAlignedTimeUpdate() {
      const now = new Date();
      const currentMinutes = now.getUTCMinutes();
      const nextAlignedMinutes = Math.ceil(currentMinutes / 10) * 10;
      const delayUntilNextUpdate =
        (nextAlignedMinutes - currentMinutes) * 60 * 1000 - now.getUTCSeconds() * 1000;

      setTimeout(async () => {
        await updateTimeChannel();
        setInterval(updateTimeChannel, 10 * 60 * 1000); // Update every 10 minutes
      }, delayUntilNextUpdate);
    }

    // Initial updates
    await updateTimeChannel(); // Update the time channel immediately
    await updateDateChannel(); // Update the date channel immediately

    // Schedule updates
    scheduleAlignedTimeUpdate(); // Align time updates
    scheduleMidnightUpdate(); // Schedule date updates at midnight
  },
};
