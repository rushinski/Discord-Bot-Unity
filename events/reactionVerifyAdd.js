const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: Events.MessageReactionAdd,
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
      if (role) {
        await member.roles.add(role);

        // Send a temporary message in the channel
        const replyMessage = await message.channel.send({
          content: `${user}, you have been verified and assigned the role **${role.name}**!`,
          allowedMentions: { users: [user.id] }, // Ping only the reacting user
        });

        // Delete the reply after 5 seconds
        setTimeout(() => {
          replyMessage.delete().catch(err => console.error(`Failed to delete message: ${err.message}`));
        }, 5000);

        // Send a DM to the user
        const embed = new EmbedBuilder()
        .setTitle(`Succesfully Verified! What's Next?`)
        .setDescription(`You have successfully verified! Next head over to https://discord.com/channels/1245050735138308116/1276264061083844618 to select roles and let us get to know you a little bit better!`)
        .setColor('Green')
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
