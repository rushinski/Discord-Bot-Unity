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

      // Fetch config from DB
      const config = await RoleReactionMessage.findOne({ messageId: message.id });
      if (!config) return;

      // Handle verification special case
      if (config.messageType === 'verification' && emoji.name === '✅') {
        await createVerificationTicket(member, reaction, user);
        return;
      }

      // Look up role dynamically from DB
      const roleConfig = config.roles.find(r => r.emoji === emoji.name);
      if (!roleConfig) return;

      const role = message.guild.roles.cache.find(r => r.name === roleConfig.roleName);
      if (!role) {
        console.warn(`⚠️ Role "${roleConfig.roleName}" not found in guild.`);
        return;
      }

      await member.roles.add(role);

      // Temporary confirmation message
      const reply = await message.channel.send(`${user}, you've been assigned **${role.name}**.`);
      setTimeout(() => reply.delete().catch(() => null), 5000);
    } catch (error) {
      console.error('❌ Error handling reaction add:', error);
    }
  },
};
