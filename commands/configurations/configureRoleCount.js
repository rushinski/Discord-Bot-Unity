/**
 * Command: /configure-role-count
 * ------------------------------
 * Configures or updates a role-count tracker for a given role.
 * Links a role to a voice channel where the channel name will
 * dynamically update with the number of members in that role.
 *
 * Example usage:
 * /configure-role-count
 *   role: @Whales
 *   channel-id: 1234567890
 *   label: Whales
 *   emoji: 🐳
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const RoleCountConfig = require('../../schemas/roleCountConfig');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('configure-role-count')
    .setDescription('Configure a role count tracker for a specific role and voice channel.')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to track.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('channel-id')
        .setDescription('The ID of the **voice channel** where the role count will be displayed.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('label')
        .setDescription('The label to display in the voice channel name.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('emoji')
        .setDescription('Optional emoji to prefix the channel name.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const role = interaction.options.getRole('role');
      const channelId = interaction.options.getString('channel-id').trim();
      const label = interaction.options.getString('label').trim();
      const emoji = interaction.options.getString('emoji')?.trim() || '';

      // 🔍 Validate channel ID
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        await interaction.editReply({
          content: `⚠️ Invalid channel ID provided: \`${channelId}\`. Please ensure the ID is correct.`,
          flags: 64,
        });
        return;
      }

      // 🎙️ Ensure channel is a voice channel
      if (channel.type !== ChannelType.GuildVoice) {
        await interaction.editReply({
          content: `⚠️ The channel ID provided must be a **Voice Channel**.`,
          flags: 64,
        });
        return;
      }

      // 🔄 Upsert role count configuration
      const existing = await RoleCountConfig.findOne({
        guildId: interaction.guild.id,
        roleId: role.id,
      });

      if (existing) {
        existing.channelId = channelId;
        existing.label = label;
        existing.emoji = emoji;
        await existing.save();
        console.log(`[RoleSystem] Updated role count config for role ${role.name} in guild ${interaction.guild.id}`);
      } else {
        await RoleCountConfig.create({
          guildId: interaction.guild.id,
          roleId: role.id,
          channelId,
          label,
          emoji,
        });
        console.log(`[RoleSystem] Created new role count config for role ${role.name} in guild ${interaction.guild.id}`);
      }

      await interaction.editReply({
        content: `✅ Role count tracking configured:\nRole: **${role.name}**\nVoice Channel ID: \`${channelId}\`\nLabel: "${label}"\nEmoji: ${emoji || 'None'}`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[RoleSystem] Error configuring role count in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: '❌ Failed to configure role count. Please try again later.',
        flags: 64,
      });
    }
  },
};
