/**
 * Event: ClientReady → Role Count Updater
 *
 * Purpose:
 * Maintains real-time role membership counts by updating the names
 * of configured voice channels with the current number of members
 * assigned to a role.
 *
 * Responsibilities:
 * - Retrieve role count configurations from the database.
 * - For each configuration, locate the guild, role, and channel.
 * - Update the channel name to reflect the number of role members.
 * - Repeat updates on a fixed interval to keep counts accurate.
 *
 * Recruiter Notes:
 * This event demonstrates automated synchronization between role
 * membership and visible server state. It ensures live statistics
 * are displayed in Discord without manual intervention. The design
 * favors resilience, logging warnings for missing data while
 * continuing to process valid configurations.
 */

const RoleCountConfig = require('../schemas/roleCountConfig');

module.exports = {
  name: 'clientReady',
  once: true,

  /**
   * Execute the role count updater after the client is ready.
   * @param {object} client - The initialized Discord client instance.
   */
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
            console.warn(`[RoleSystem] Channel invalid or not a voice channel: ${config.channelId} in guild ${guild.id}`);
            continue;
          }

          const memberCount = role.members.size;
          const newChannelName = `${config.label} : ${memberCount}`;

          if (config.emoji) {
            // Prepend emoji if configured
            const prefixedName = `${config.emoji} | ${newChannelName}`;
            if (channel.name !== prefixedName) {
              await channel.setName(prefixedName);
              console.log(`[RoleSystem] Updated role count channel in guild ${guild.id}: ${prefixedName}`);
            }
          } else if (channel.name !== newChannelName) {
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
