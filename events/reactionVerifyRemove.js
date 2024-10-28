// events/reactionRoleRemove.js
const { Events } = require('discord.js');

const reactionRoleChannelId = '1245564997128683571'; // Replace with your channel ID
const reactionMessageId = '1300510787793719409'; // Replace with your message ID
const roles = {
  '✅': '1245564960269144205'
};

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (reaction.message.channel.id !== reactionRoleChannelId || reaction.message.id !== reactionMessageId || user.bot) return;

    const roleId = roles[reaction.emoji.name];
    if (roleId) {
      const member = await reaction.message.guild.members.fetch(user.id);
      await member.roles.remove(roleId);
      console.log(`Removed role from ${user.tag} based on reaction removal.`);
    }
  },
};
