const { Events, EmbedBuilder } = require('discord.js');
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

    // Remove roles based on emoji
    if (emoji.name === '✅') {
      const role = message.guild.roles.cache.find(r => r.name === 'Jumpers');
      if (role) {
        await member.roles.remove(role);

        // Send a temporary message in the channel
        const replyMessage = await message.channel.send({
          content: `${user}, the role **${role.name}** has been removed from you.`,
          allowedMentions: { users: [user.id] }, // Ping only the reacting user
        });

        // Delete the reply after 5 seconds
        setTimeout(() => {
          replyMessage.delete().catch(err => console.error(`Failed to delete message: ${err.message}`));
        }, 5000);

        // Send a DM to the user
        const embed = new EmbedBuilder()
          .setTitle('Re-Verify Right Now you meanie 😠')
          .setDescription(`grrrrrrrrrrrrrrrrrrrrrrrrrr`)
          .setColor('Red')
          .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

        // Send the embed as a DM
        try {
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Could not send DM to ${user.tag}: ${error.message}`);
        }
      }
    }
  },
};
