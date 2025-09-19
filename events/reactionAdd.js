/**
 * Event: MessageReactionAdd
 * -------------------------
 * Handles reaction-role assignments.
 * Dynamically resolves role configs from the database
 * and applies the corresponding role to the reacting user.
 */

const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');
const createVerificationTicket = require('../utils/createVerificationTicket');

module.exports = {
  name: Events.MessageReactionAdd,

  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;

    try {
      const member = await message.guild.members.fetch(user.id);

      // Fetch configuration from DB
      const config = await RoleReactionMessage.findOne({ messageId: message.id });
      if (!config) return;

      // ✅ Handle verification category separately
      if (config.messageType === 'verification' && emoji.name === '✅') {
        await createVerificationTicket(member, reaction, user);
        return;
      }

      // 🎭 Find role by emoji mapping
      const roleConfig = config.roles.find(r => r.emoji === emoji.name);
      if (!roleConfig) return;

      const role = message.guild.roles.cache.find(r => r.name === roleConfig.roleName);
      if (!role) {
        console.warn(`[RoleSystem] Role "${roleConfig.roleName}" not found in guild ${message.guild.id}.`);
        return;
      }

      await member.roles.add(role);

      // 🎉 Ephemeral-style confirmation
      await message.channel.send({
        content: `${user}, you've been assigned **${role.name}**.`,
        flags: 64, // ephemeral flag
      });
    } catch (error) {
      console.error(`[RoleSystem] Error in reactionAdd handler for guild ${message.guild?.id}:`, error);

      try {
        await message.channel.send({
          content: `⚠️ Sorry ${user}, something went wrong while assigning your role.`,
          flags: 64, // ephemeral flag
        });
      } catch (sendError) {
        console.error('[RoleSystem] Failed to send error message:', sendError);
      }
    }
  },
};
