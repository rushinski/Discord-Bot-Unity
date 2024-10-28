// events/reactionRoleAdd.js
const { Events } = require('discord.js');

const reactionRoleChannelId = '1245564997128683571'; // Replace with your channel ID
const reactionMessageId = '1300510787793719409'; // Replace with your message ID
const roles = {
  '✅': '1245564960269144205'
};

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (reaction.message.channel.id !== reactionRoleChannelId || reaction.message.id !== reactionMessageId || user.bot) return;

    const roleId = roles[reaction.emoji.name];
    if (roleId) {
      const member = await reaction.message.guild.members.fetch(user.id);
      await member.roles.add(roleId);
      console.log(`Assigned role to ${user.tag} based on reaction.`);
    }
  },
};
