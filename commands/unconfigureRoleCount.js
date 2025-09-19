const { SlashCommandBuilder, ChannelType } = require('discord.js');
const RoleCountConfig = require('../schemas/RoleCountConfig');

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
    await interaction.deferReply({ ephemeral: true });

    try {
      const role = interaction.options.getRole('role');
      const deleteChannel = interaction.options.getBoolean('delete-channel') || false;

      const config = await RoleCountConfig.findOneAndDelete({
        guildId: interaction.guild.id,
        roleId: role.id,
      });

      if (!config) {
        await interaction.editReply(
          `⚠️ No role count configuration found for **${role.name}**.`
        );
        return;
      }

      // ✅ Optionally delete the configured voice channel
      if (deleteChannel && config.channelId) {
        const channel = interaction.guild.channels.cache.get(config.channelId);
        if (channel && channel.type === ChannelType.GuildVoice) {
          try {
            await channel.delete();
            console.log(`✅ Deleted voice channel ${channel.id} for role count config.`);
          } catch (err) {
            console.warn(`⚠️ Failed to delete channel ${config.channelId}:`, err.message);
          }
        } else {
          console.warn(`⚠️ Configured channel ${config.channelId} not found or not a voice channel.`);
        }
      }

      await interaction.editReply(
        `✅ Role count tracking removed for role: **${role.name}**.${deleteChannel ? ' Channel deleted.' : ''}`
      );
    } catch (error) {
      console.error('❌ Error unconfiguring role count:', error);
      await interaction.editReply('❌ Failed to unconfigure role count. Please try again later.');
    }
  },
};
