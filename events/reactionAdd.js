/**
 * Event: MessageReactionAdd
 *
 * Purpose:
 * Assigns roles to members when they react to a configured role
 * selection message. Each reaction corresponds to a specific role.
 *
 * Responsibilities:
 * - Resolve the correct role configuration for the reacted message.
 * - Match the emoji reaction to the configured role mapping.
 * - Assign the role to the reacting member if it exists in the guild.
 * - Handle errors gracefully without disrupting bot operation.
 *
 * Recruiter Notes:
 * This event demonstrates how interactive role assignment can be
 * implemented in a controlled and auditable way. Roles are linked
 * to emoji reactions, configuration is database-driven, and logging
 * provides clear traceability if a failure occurs.
 */

const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/roleReactionMessage');

module.exports = {
  name: Events.MessageReactionAdd,

  /**
   * Execute the role assignment on reaction add.
   * @param {object} reaction - The Discord reaction object.
   * @param {object} user - The user who added the reaction.
   */
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;

    try {
      const member = await message.guild.members.fetch(user.id);

      // Load role configuration for this message
      const config = await RoleReactionMessage.findOne({ messageId: message.id });
      if (!config) return;

      // Match emoji to configured role
      const roleConfig = config.roles.find(r => r.emoji === emoji.name);
      if (!roleConfig) return;

      const role = message.guild.roles.cache.find(r => r.name === roleConfig.roleName);
      if (!role) {
        console.warn(`[RoleSystem] Role "${roleConfig.roleName}" not found in guild ${message.guild.id}.`);
        return;
      }

      // Assign role to the member
      await member.roles.add(role);
      console.log(`[RoleSystem] Assigned role "${role.name}" to user ${user.tag} in guild ${message.guild.id}.`);
    } catch (error) {
      console.error(`[RoleSystem] Error in MessageReactionAdd handler for guild ${message.guild?.id}:`, error);
    }
  },
};
