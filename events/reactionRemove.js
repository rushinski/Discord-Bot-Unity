const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const member = message.guild.members.cache.get(user.id);

    const dbMessage = await RoleReactionMessage.findOne({ messageId: message.id });
    if (!dbMessage) return;

    const roleMappings = {
      // Define the mappings for each type.
      continent: {
        '🦁': 'Africa',
        '🦅': 'North America',
        '🦜': 'South America',
        '🐂': 'Europe',
        '🐼': 'Asia',
        '🐨': 'Oceania',
        '🐧': 'Antarctica',
      },
      spender: {
        '🦐': 'F2P',
        '🐟': 'Low Spender',
        '🐬': 'Mid Spender',
        '🦈': 'High Spender',
        '🐋': 'Whale',
        '🦑': 'Kraken',
      },
      troop: {
        '⚔️': 'Infantry',
        '🐎': 'Cavalry',
        '🏹': 'Archers',
        '🚜': 'Siege',
      },
      experience: {
        '🥚': 'Brand New Player',
        '🐣': 'No KvK Experience',
        '1️⃣': 'KvK1',
        '2️⃣': 'KvK2',
        '3️⃣': 'KvK3',
        '⭐': 'Soc',
      },
      jumped: {
        '✅': 'Jumped Before',
        '❌': 'New Jumper',
      },
      jumperType: {
        '💪': 'Booster',
        '💤': 'Sleeper',
        '🚀': 'Jumper',
      },
    };

    const roleName = roleMappings[dbMessage.messageType]?.[emoji.name];
    if (!roleName) return;

    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (role) {
      await member.roles.remove(role);
      const reply = await message.channel.send(`${user}, **${role.name}** has been removed.`);
      setTimeout(() => reply.delete(), 5000);
    }
  },
};
