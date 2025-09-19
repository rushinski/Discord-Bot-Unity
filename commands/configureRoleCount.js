const { SlashCommandBuilder, ChannelType } = require('discord.js');
const RoleCountConfig = require('../schemas/RoleCountConfig');

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
    await interaction.deferReply({ ephemeral: true });

    try {
      const role = interaction.options.getRole('role');
      const channelId = interaction.options.getString('channel-id');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji') || '';

      // ✅ Validate channel ID
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.editReply(
          `⚠️ Invalid channel ID provided: \`${channelId}\`. Please ensure the ID is correct.`
        );
      }

      // ✅ Ensure channel is a voice channel
      if (channel.type !== ChannelType.GuildVoice) {
        return interaction.editReply(
          `⚠️ The channel ID provided must be a **Voice Channel**.`
        );
      }

      // ✅ Upsert config for this role
      const existing = await RoleCountConfig.findOne({
        guildId: interaction.guild.id,
        roleId: role.id,
      });

      if (existing) {
        existing.channelId = channelId;
        existing.label = label;
        existing.emoji = emoji;
        await existing.save();
      } else {
        await RoleCountConfig.create({
          guildId: interaction.guild.id,
          roleId: role.id,
          channelId,
          label,
          emoji,
        });
      }

      await interaction.editReply(
        `✅ Role count tracking configured:\nRole: **${role.name}**\nVoice Channel ID: \`${channelId}\`\nLabel: "${label}"\nEmoji: ${emoji || 'None'}`
      );
    } catch (error) {
      console.error('❌ Error configuring role count:', error);
      await interaction.editReply('❌ Failed to configure role count. Please try again later.');
    }
  },
};
