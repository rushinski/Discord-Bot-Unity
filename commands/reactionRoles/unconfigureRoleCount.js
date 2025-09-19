/**
 * Command: /unconfigure-role-count
 * --------------------------------
 * Removes a role-count tracker configuration for the guild.
 * Optionally deletes the configured voice channel from the guild.
 *
 * Example usage:
 * /unconfigure-role-count
 *   role: @Whales
 *   delete-channel: true
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const RoleCountConfig = require('../../schemas/RoleCountConfig');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('unconfigure-role-count')
    .setDescription('Remove a role count tracker configuration and optionally delete the channel.')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role whose count tracking should be removed.')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('delete-channel')
        .setDescription('If true, delete the configured voice channel from the guild.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const role = interaction.options.getRole('role');
      const deleteChannel = interaction.options.getBoolean('delete-channel') || false;

      const config = await RoleCountConfig.findOneAndDelete({
        guildId: interaction.guild.id,
        roleId: role.id,
      });

      if (!config) {
        await interaction.editReply({
          content: `⚠️ No role count configuration found for **${role.name}**.`,
          flags: 64,
        });
        return;
      }

      // 🧹 Optionally delete the configured voice channel
      if (deleteChannel && config.channelId) {
        const channel = interaction.guild.channels.cache.get(config.channelId);

        if (channel && channel.type === ChannelType.GuildVoice) {
          try {
            await channel.delete();
            console.log(`[RoleSystem] Deleted voice channel ${channel.id} for role count config in guild ${interaction.guild.id}`);
          } catch (err) {
            console.warn(`[RoleSystem] Failed to delete channel ${config.channelId} in guild ${interaction.guild.id}:`, err.message);
          }
        } else {
          console.warn(`[RoleSystem] Configured channel ${config.channelId} not found or not a voice channel in guild ${interaction.guild.id}.`);
        }
      }

      await interaction.editReply({
        content: `✅ Role count tracking removed for role: **${role.name}**.${deleteChannel ? ' Channel deleted.' : ''}`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[RoleSystem] Error unconfiguring role count in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: '❌ Failed to unconfigure role count. Please try again later.',
        flags: 64,
      });
    }
  },
};
