const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const member = message.guild.members.cache.get(user.id);

    // Load message IDs
    const reactionMessageId = fs.readFileSync('txtIds/verifyReactionId.txt', 'utf-8');
    const troopMessageId = fs.readFileSync('txtIds/troopEmbed.txt', 'utf-8');
    const spenderMessageId = fs.readFileSync('txtIds/spenderEmbed.txt', 'utf-8');
    const jumperTypeMessageId = fs.readFileSync('txtIds/jumperTypeEmbed.txt', 'utf-8');
    const jumpedMessageId = fs.readFileSync('txtIds/jumpedEmbed.txt', 'utf-8');
    const genderMessageId = fs.readFileSync('txtIds/genderEmbed.txt', 'utf-8');
    const experienceMessageId = fs.readFileSync('txtIds/experienceEmbed.txt', 'utf-8');
    const continentMessageId = fs.readFileSync('txtIds/continentEmbed.txt', 'utf-8');

    // Define role mappings
    const roleMappings = {
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

    // Check if the message is for verification
    if (message.id === reactionMessageId && emoji.name === '✅') {
      const role = message.guild.roles.cache.find(r => r.name === 'Jumpers');
      if (role) {
        try {
          await member.roles.add(role);

          // Send a temporary confirmation message
          const replyMessage = await message.channel.send({
            content: `${user}, you have been verified and assigned the role **${role.name}**!`,
            allowedMentions: { users: [user.id] },
          });

          setTimeout(() => {
            replyMessage.delete().catch(err => console.error(`Failed to delete message: ${err.message}`));
          }, 5000);

          // Send DM with further instructions
          const embed = new EmbedBuilder()
            .setTitle('Successfully Verified! What’s Next?')
            .setDescription(
              `You have successfully verified! Head over to:\n` +
              `- [Select Roles](https://discord.com/channels/1245050735138308116/1276264061083844618): Let us get to know you a little better!\n` +
              `- [Giveaways](https://discord.com/channels/1245050735138308116/1298113476580868127): Check out what giveaways are going on!`
            )
            .setColor('Green')
            .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Could not assign role or send DM: ${error.message}`);
        }
      }
      return;
    }

    // Check if the reaction matches one of the role categories
    const rolesMap = roleMappings[message.id];
    if (!rolesMap) return;

    // Assign the role based on the emoji
    const roleName = rolesMap[emoji.name];
    if (roleName) {
      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (role) {
        try {
          await member.roles.add(role);

          // Send a temporary confirmation message
          const replyMessage = await message.channel.send({
            content: `${user}, you have been assigned the role **${role.name}**!`,
            allowedMentions: { users: [user.id] },
          });

          setTimeout(() => {
            replyMessage.delete().catch(err => console.error(`Failed to delete message: ${err.message}`));
          }, 5000);
        } catch (error) {
          console.error(`Failed to assign role: ${error.message}`);
        }
      } else {
        console.error(`Role not found: ${roleName}`);
      }
    }
  },
};
