module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // Replace with your specific role ID and channel ID
    const roleId = '1319732727355805737'; // Role to track
    const channelId = '1308243642938425366'; // Channel to update

    const updateRoleCount = async () => {
      try {
        // Fetch the guild (server) where the bot is active
        const guild = client.guilds.cache.first(); // Adjust if the bot is in multiple guilds
        if (!guild) {
          console.error('Guild not found.');
          return;
        }

        // Fetch the role and channel
        const role = guild.roles.cache.get(roleId);
        const channel = await client.channels.fetch(channelId);

        if (!role) {
          console.error(`Role with ID ${roleId} not found.`);
          return;
        }
        if (!channel || !channel.isTextBased()) {
          console.error('Channel not found or is not text-based.');
          return;
        }

        // Get the number of members with the role
        const memberCount = role.members.size;

        // Format the channel name
        const newChannelName = `🌟︱ᴠɪᴘ ᴍᴇᴍʙᴇʀs : ${memberCount}`;

        // Update the channel name
        if (channel.name !== newChannelName) {
          await channel.setName(newChannelName);
          console.log(`Updated channel name to: ${newChannelName}`);
        }
      } catch (error) {
        console.error('Error updating role count channel:', error);
      }
    };

    // Run the updater every minute
    setInterval(updateRoleCount, 60000); // Adjust the interval as needed
  },
};
