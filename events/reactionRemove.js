/**
 * Event: MessageReactionRemove
 *
 * Purpose:
 * Removes roles from members when they remove their reaction from a
 * configured role selection message. Each reaction corresponds to a
 * specific role, which is revoked if the reaction is withdrawn.
 *
 * Responsibilities:
 * - Resolve the correct role configuration for the reacted message.
 * - Match the removed emoji reaction to the configured role mapping.
 * - Remove the role from the member if it exists in the guild.
 * - Handle errors gracefully without interrupting bot operation.
 *
 * Recruiter Notes:
 * This event demonstrates how role management can be symmetrically
 * tied to user interaction. Members can both opt in and opt out of
 * roles, and the system ensures changes are applied consistently with
 * clear error handling and structured logging.
 */

const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/roleReactionMessage');

module.exports = {
  name: Events.MessageReactionRemove,

  /**
   * Execute the role removal on reaction remove.
   * @param {object} reaction - The Discord reaction object.
   * @param {object} user - The user who removed the reaction.
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

      // Remove role from the member
      await member.roles.remove(role);
      console.log(`[RoleSystem] Removed role "${role.name}" from user ${user.tag} in guild ${message.guild.id}.`);
    } catch (error) {
      console.error(`[RoleSystem] Error in MessageReactionRemove handler for guild ${message.guild?.id}:`, error);
    }
  },
};
