/**
 * Event: MessageReactionRemove
 * ----------------------------
 * Handles reaction-role removals.
 * Dynamically resolves role configs from the database
 * and removes the corresponding role from the user.
 */

const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  name: Events.MessageReactionRemove,

  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;

    try {
      const member = await message.guild.members.fetch(user.id);

      // 🔍 Fetch configuration from DB
      const config = await RoleReactionMessage.findOne({ messageId: message.id });
      if (!config) return;

      // 🎭 Find role by emoji mapping
      const roleConfig = config.roles.find(r => r.emoji === emoji.name);
      if (!roleConfig) return;

      const role = message.guild.roles.cache.find(r => r.name === roleConfig.roleName);
      if (!role) {
        console.warn(`[RoleSystem] Role "${roleConfig.roleName}" not found in guild ${message.guild.id}.`);
        return;
      }

      await member.roles.remove(role);

      // 🎉 Ephemeral-style confirmation
      await message.channel.send({
        content: `${user}, **${role.name}** has been removed.`,
        flags: 64, // ephemeral flag
      });
    } catch (error) {
      console.error(`[RoleSystem] Error in reactionRemove handler for guild ${message.guild?.id}:`, error);

      try {
        await message.channel.send({
          content: `⚠️ Sorry ${user}, something went wrong while removing your role.`,
          flags: 64, // ephemeral flag
        });
      } catch (sendError) {
        console.error('[RoleSystem] Failed to send error message:', sendError);
      }
    }
  },
};
