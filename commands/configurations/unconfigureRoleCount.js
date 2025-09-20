/**
 * File: unconfigureRoleCount.js
 * Purpose: Slash command to remove a role-count tracker configuration.
 *
 * Responsibilities:
 * - Allow administrators to remove a role-count tracker for a given role.
 * - Optionally delete the associated voice channel from the guild.
 * - Ensure database configuration is cleared.
 *
 * Notes for Recruiters:
 * Role-count trackers automatically update a voice channel’s name to show
 * how many members have a particular role. This command disables that tracker.
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const RoleCountConfig = require('../../schemas/roleCountConfig');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('unconfigure-role-count')
    .setDescription('Remove a role count tracker configuration and optionally delete its voice channel.')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role whose count tracking should be removed.')
        .setRequired(true),
    )
    .addBooleanOption(option =>
      option
        .setName('delete-channel')
        .setDescription('If true, delete the associated voice channel.')
        .setRequired(false),
    ),

  /**
   * Execute the unconfigure-role-count command.
   * @param {object} interaction - The Discord interaction instance.
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const role = interaction.options.getRole('role');
      const deleteChannel = interaction.options.getBoolean('delete-channel') || false;

      // Remove configuration from database
      const config = await RoleCountConfig.findOneAndDelete({
        guildId: interaction.guild.id,
        roleId: role.id,
      });

      if (!config) {
        await interaction.editReply({
          content: `No role-count configuration found for role: **${role.name}**.`,
          flags: 64,
        });
        return;
      }

      // Optionally delete the configured voice channel
      if (deleteChannel && config.channelId) {
        const channel = interaction.guild.channels.cache.get(config.channelId);

        if (channel && channel.type === ChannelType.GuildVoice) {
          try {
            await channel.delete();
            console.log(`[UnconfigureRoleCount] Deleted voice channel ${channel.id} for role ${role.name} in guild ${interaction.guild.id}`);
          } catch (err) {
            console.warn(`[UnconfigureRoleCount] Failed to delete channel ${config.channelId} in guild ${interaction.guild.id}:`, err.message);
          }
        } else {
          console.warn(`[UnconfigureRoleCount] Configured channel ${config.channelId} not found or not a voice channel in guild ${interaction.guild.id}.`);
        }
      }

      await interaction.editReply({
        content: `Role-count tracking removed for role: **${role.name}**.${deleteChannel ? ' Associated channel deleted.' : ''}`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[UnconfigureRoleCount] Error unconfiguring role count in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: 'An unexpected error occurred while unconfiguring role count. Please try again later.',
        flags: 64,
      });
    }
  },
};
