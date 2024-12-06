const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const member = message.guild.members.cache.get(user.id);

    // Load the saved message IDs
    const reactionMessageId = fs.readFileSync('txtIds/verifyReactionId.txt', 'utf-8');
    const troopMessageId = fs.readFileSync('txtIds/troopEmbed.txt', 'utf-8');
    const spenderMessageId = fs.readFileSync('txtIds/spenderEmbed.txt', 'utf-8');
    const jumperTypeMessageId = fs.readFileSync('txtIds/jumperTypeEmbed.txt', 'utf-8');
    const jumpedMessageId = fs.readFileSync('txtIds/jumpedEmbed.txt', 'utf-8');
    const genderMessageId = fs.readFileSync('txtIds/genderEmbed.txt', 'utf-8');
    const experienceMessageId = fs.readFileSync('txtIds/experienceEmbed.txt', 'utf-8');
    const continentMessageId = fs.readFileSync('txtIds/continentEmbed.txt', 'utf-8');

    // Define roles for each category
    const roleMaps = {
      [troopMessageId]: {
        '⚔️': 'Infantry',
        '🐎': 'Cavalry',
        '🏹': 'Archers',
        '🚜': 'Siege',
      },
      [spenderMessageId]: {
        '🦐': 'F2P',
        '🐟': 'Low Spender',
        '🐬': 'Mid Spender',
        '🦈': 'High Spender',
        '🐋': 'Whale',
        '🦑': 'Kraken',
      },
      [jumperTypeMessageId]: {
        '💪': 'Booster',
        '💤': 'Sleeper',
      },
      [jumpedMessageId]: {
        '✅': 'Jumped Before',
        '❌': 'New Jumper',
      },
      [genderMessageId]: {
        '👦': 'Male',
        '👧': 'Female',
        '❓': 'Other',
      },
      [experienceMessageId]: {
        '🥚': 'Brand New Player',
        '🐣': 'No KvK Experience',
        '1️⃣': 'KvK1',
        '2️⃣': 'KvK2',
        '3️⃣': 'KvK3',
        '⭐': 'Soc',
      },
      [continentMessageId]: {
        '🦁': 'Africa',
        '🦅': 'North America',
        '🦜': 'South America',
        '🐂': 'Europe',
        '🐼': 'Asia',
        '🐨': 'Oceania',
        '🐧': 'Antarctica',
      },
    };

    // Handle verification-specific logic
    if (message.id === reactionMessageId && emoji.name === '✅') {
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

        try {
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Could not send DM to ${user.tag}: ${error.message}`);
        }
      }
      return;
    }

    // General role removal logic
    const rolesMap = roleMaps[message.id];
    if (!rolesMap) return; // Exit if the message doesn't match any category

    const roleName = rolesMap[emoji.name];
    if (roleName) {
      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (role) {
        try {
          await member.roles.remove(role);

          // Send a temporary message in the channel
          const replyMessage = await message.channel.send({
            content: `${user}, the role **${role.name}** has been removed.`,
            allowedMentions: { users: [user.id] }, // Ping only the reacting user
          });

          // Delete the reply after 5 seconds
          setTimeout(() => {
            replyMessage.delete().catch(err => console.error(`Failed to delete message: ${err.message}`));
          }, 5000);
        } catch (err) {
          console.error(`Failed to remove role: ${err.message}`);
        }
      } else {
        console.error(`Role not found: ${roleName}`);
      }
    }
  },
};
