const { Events } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const member = message.guild.members.cache.get(user.id);

    // Load the saved message ID
    const reactionMessageId = fs.readFileSync('txtIds/verifyReactionId.txt', 'utf-8');
    if (message.id !== reactionMessageId) return; // Ensure it's the correct message

    // Assign roles based on emoji
    if (emoji.name === '✅') {
      const role = message.guild.roles.cache.find(r => r.name === 'Jumpers');
      if (role) await member.roles.remove(role);
    }
  },
};
