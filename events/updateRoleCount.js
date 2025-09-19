const RoleCountConfig = require('../schemas/RoleCountConfig');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    const updateRoleCounts = async () => {
      try {
        // Fetch configs for all guilds
        const configs = await RoleCountConfig.find({});
        if (!configs.length) return;

        for (const config of configs) {
          const guild = client.guilds.cache.get(config.guildId);
          if (!guild) {
            console.warn(`⚠️ Guild not found for ID: ${config.guildId}`);
            continue;
          }

          const role = guild.roles.cache.get(config.roleId);
          const channel = await client.channels.fetch(config.channelId).catch(() => null);

          if (!role) {
            console.warn(`⚠️ Role not found for ID: ${config.roleId}`);
            continue;
          }
          if (!channel || !channel.isTextBased()) {
            console.warn(`⚠️ Channel not found or invalid for ID: ${config.channelId}`);
            continue;
          }

          const memberCount = role.members.size;
          const newChannelName = `${config.emoji ? config.emoji + '︱' : ''}${config.label} : ${memberCount}`;

          if (channel.name !== newChannelName) {
            await channel.setName(newChannelName);
            console.log(`✅ Updated channel for guild ${guild.id}: ${newChannelName}`);
          }
        }
      } catch (error) {
        console.error('❌ Error updating role counts:', error);
      }
    };

    // Run updater every minute
    setInterval(updateRoleCounts, 60000);
  },
};
