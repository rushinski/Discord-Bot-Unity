/**
 * Command: /configure-reaction-roles
 * ----------------------------------
 * Configures or updates a reaction-role category dynamically.
 * Stores category description and emoji:roleName mappings
 * in the database for use by /send-role-select.
 *
 * Example usage:
 * /configure-reaction-roles
 *   category: continent
 *   description: "Select your continent"
 *   roles: 🦁:Africa, 🐼:Asia
 */

const { SlashCommandBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/roleReactionMessage');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('configure-reaction-roles')
    .setDescription('Configure a reaction-role category dynamically.')
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
    await interaction.deferReply({ flags: 64 });

    try {
      const category = interaction.options.getString('category').trim();
      const description = interaction.options.getString('description').trim();
      const rolesInput = interaction.options.getString('roles').trim();

      // 🧩 Parse emoji:roleName pairs
      const roles = rolesInput.split(',').map(pair => {
        const [emoji, roleName] = pair.trim().split(':');
        if (!emoji || !roleName) {
          throw new Error(`Invalid format for role pair: "${pair}"`);
        }
        return { emoji: emoji.trim(), roleName: roleName.trim() };
      });

      // 🔄 Upsert configuration
      const existing = await RoleReactionMessage.findOne({
        messageType: category,
        guildId: interaction.guild.id,
      });

      if (existing) {
        existing.description = description;
        existing.roles = roles;
        await existing.save();
        console.log(`[RoleSystem] Updated reaction role config: ${category} in guild ${interaction.guild.id}`);
      } else {
        await RoleReactionMessage.create({
          messageType: category,
          guildId: interaction.guild.id,
          channelId: interaction.channel.id,
          messageId: null, // will be set when /send-role-select posts
          description,
          roles,
        });
        console.log(`[RoleSystem] Created new reaction role config: ${category} in guild ${interaction.guild.id}`);
      }

      await interaction.editReply({
        content: `✅ Reaction-role category **${category}** configured successfully!`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[RoleSystem] Error configuring reaction roles in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: '❌ Failed to configure reaction roles. Please check your input format.',
        flags: 64,
      });
    }
  },
};
