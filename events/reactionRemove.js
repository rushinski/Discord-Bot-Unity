const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;

    try {
      const member = await message.guild.members.fetch(user.id);

      // Fetch config from DB
      const config = await RoleReactionMessage.findOne({ messageId: message.id });
      if (!config) return;

      // Look up role dynamically from DB
      const roleConfig = config.roles.find(r => r.emoji === emoji.name);
      if (!roleConfig) return;

      const role = message.guild.roles.cache.find(r => r.name === roleConfig.roleName);
      if (!role) {
        console.warn(`⚠️ Role "${roleConfig.roleName}" not found in guild.`);
        return;
      }

      await member.roles.remove(role);

      // Temporary confirmation message
      const reply = await message.channel.send(`${user}, **${role.name}** has been removed.`);
      setTimeout(() => reply.delete().catch(() => null), 5000);
    } catch (error) {
      console.error('❌ Error handling reaction remove:', error);
    }
  },
};
