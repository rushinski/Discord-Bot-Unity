/**
 * File: configureReactionRoles.js
 * Purpose: Slash command to configure or update a reaction-role category.
 *
 * Responsibilities:
 * - Allow administrators to define categories for reaction roles.
 * - Store an embed description and emoji-to-role mappings in the database.
 * - Support updating existing categories or creating new ones.
 *
 * Notes for Recruiters:
 * Reaction roles let users assign themselves roles by clicking on emojis.
 * This command configures the available categories so that another command
 * (e.g., /send-role-select) can later post the interactive role selection message.
 */

const { SlashCommandBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/roleReactionMessage');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('configure-reaction-roles')
    .setDescription('Configure or update a reaction-role category.')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Category name (e.g., continent, spender, troop)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Embed description text for the role category')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('roles')
        .setDescription('Comma-separated emoji:roleName list (e.g., 🦁:Africa, 🐼:Asia)')
        .setRequired(true),
    ),

  /**
   * Execute the configure-reaction-roles command.
   * @param {object} interaction - The Discord interaction instance.
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const category = interaction.options.getString('category').trim();
      const description = interaction.options.getString('description').trim();
      const rolesInput = interaction.options.getString('roles').trim();

      // Parse emoji:roleName pairs
      const roles = rolesInput.split(',').map(pair => {
        const [emoji, roleName] = pair.trim().split(':');
        if (!emoji || !roleName) {
          throw new Error(`Invalid format for role pair: "${pair}"`);
        }
        return { emoji: emoji.trim(), roleName: roleName.trim() };
      });

      // Find existing configuration or create new
      const existing = await RoleReactionMessage.findOne({
        messageType: category,
        guildId: interaction.guild.id,
      });

      if (existing) {
        existing.description = description;
        existing.roles = roles;
        await existing.save();
        console.log(`[ConfigureReactionRoles] Updated config: ${category} in guild ${interaction.guild.id}`);
      } else {
        await RoleReactionMessage.create({
          messageType: category,
          guildId: interaction.guild.id,
          channelId: interaction.channel.id,
          messageId: null, // Will be linked when /send-role-select posts
          description,
          roles,
        });
        console.log(`[ConfigureReactionRoles] Created new config: ${category} in guild ${interaction.guild.id}`);
      }

      await interaction.editReply({
        content: `Reaction-role category **${category}** configured successfully.`,
        flags: 64,
      });
    } catch (error) {
      console.error(`[ConfigureReactionRoles] Error configuring category in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: 'Failed to configure reaction roles. Please check your input format.',
        flags: 64,
      });
    }
  },
};
