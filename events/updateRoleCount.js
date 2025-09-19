/**
 * Event: ClientReady
 * ------------------
 * Periodically updates voice channel names to reflect
 * the member count of configured roles.
 *
 * Example:
 * "🐳︱Whales : 25"
 */

const RoleCountConfig = require('../schemas/roleCountConfig');

module.exports = {
  name: 'clientReady',
  once: true,

  async execute(client) {
    const updateRoleCounts = async () => {
      try {
        const configs = await RoleCountConfig.find({});
        if (!configs.length) return;

        for (const config of configs) {
          const guild = client.guilds.cache.get(config.guildId);
          if (!guild) {
            console.warn(`[RoleSystem] Guild not found for ID: ${config.guildId}`);
            continue;
          }

          const role = guild.roles.cache.get(config.roleId);
          if (!role) {
            console.warn(`[RoleSystem] Role not found for ID: ${config.roleId} in guild ${guild.id}`);
            continue;
          }

          const channel = await client.channels.fetch(config.channelId).catch(() => null);
          if (!channel || channel.type !== 2) {
            // type 2 = GuildVoice
            console.warn(`[RoleSystem] Channel invalid or not a voice channel: ${config.channelId} in guild ${guild.id}`);
            continue;
          }

          const memberCount = role.members.size;
          const newChannelName = `${config.emoji ? `${config.emoji}︱` : ''}${config.label} : ${memberCount}`;

          if (channel.name !== newChannelName) {
            await channel.setName(newChannelName);
            console.log(`[RoleSystem] Updated role count channel in guild ${guild.id}: ${newChannelName}`);
          }
        }
      } catch (error) {
        console.error('[RoleSystem] Error while updating role counts:', error);
      }
    };

    // Run updater every 60 seconds
    setInterval(updateRoleCounts, 60_000);
  },
};
