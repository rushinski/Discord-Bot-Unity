// Import necessary libraries
const cron = require('node-cron');

module.exports = {
    name: 'updateTimeChannels',
    execute(client) {
        console.log(`Starting channel updates for ${client.user.tag}!`);
        updateChannels(client);
        // Schedule the task to run every minute
        cron.schedule('* * * * *', () => {
            updateChannels(client);
        });
    },
};

/**
 * Function to update the date and time channels
 * @param {Client} client - The Discord client instance
 */
async function updateChannels(client) {
    try {
        // Replace with your server and channel IDs
        const GUILD_ID = '1245050735138308116';
        const DATE_CHANNEL_ID = '1319589854316597298';
        const TIME_CHANNEL_ID = '1319590144579469353';

        const guild = await client.guilds.fetch(GUILD_ID);
        const dateChannel = await guild.channels.fetch(DATE_CHANNEL_ID);
        const timeChannel = await guild.channels.fetch(TIME_CHANNEL_ID);

        const now = new Date();
        const utcDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const utcTime = now.toISOString().split('T')[1].slice(0, 5); // HH:MM

        // Update the channel names
        if (dateChannel) await dateChannel.setName(`date-${utcDate}`);
        if (timeChannel) await timeChannel.setName(`time-${utcTime}`);

        console.log(`Updated channels: date-${utcDate} | time-${utcTime}`);
    } catch (error) {
        console.error('Error updating channels:', error);
    }
}
