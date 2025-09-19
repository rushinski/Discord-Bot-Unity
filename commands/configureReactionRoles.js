const { SlashCommandBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('configure-reaction-roles')
    .setDescription('Configure a reaction role category dynamically.')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Category name (e.g., continent, spender, troop)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Description text for the embed')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('roles')
        .setDescription('Comma-separated list of emoji:roleName (e.g., 🦁:Africa, 🐼:Asia)')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const category = interaction.options.getString('category');
      const description = interaction.options.getString('description');
      const rolesInput = interaction.options.getString('roles');

      // Parse emoji:roleName pairs
      const roles = rolesInput.split(',').map(pair => {
        const [emoji, roleName] = pair.trim().split(':');
        if (!emoji || !roleName) {
          throw new Error(`Invalid format for role pair: "${pair}"`);
        }
        return { emoji: emoji.trim(), roleName: roleName.trim() };
      });

      // Upsert (update if exists, else create new)
      const existing = await RoleReactionMessage.findOne({
        messageType: category,
        guildId: interaction.guild.id,
      });

      if (existing) {
        existing.description = description;
        existing.roles = roles;
        await existing.save();
      } else {
        await RoleReactionMessage.create({
          messageType: category,
          guildId: interaction.guild.id,
          channelId: interaction.channel.id,
          messageId: null, // will be set when /send-role-select posts
          description,
          roles,
        });
      }

      await interaction.editReply(
        `✅ Reaction role category **${category}** configured successfully!`
      );
    } catch (error) {
      console.error('Error configuring reaction roles:', error);
      await interaction.editReply(
        '❌ Failed to configure reaction roles. Please check your input format.'
      );
    }
  },
};
