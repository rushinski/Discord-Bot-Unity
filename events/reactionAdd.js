const { Events } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');
const createVerificationTicket = require('../utils/createVerificationTicket');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const member = await message.guild.members.fetch(user.id);

    try {
      // Fetch the message type from the database
      const dbMessage = await RoleReactionMessage.findOne({ messageId: message.id });
      if (!dbMessage) return;

      // Role assignment mappings
      const roleMappings = {
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

      // Check if the messageType is for role assignment
      if (roleMappings[dbMessage.messageType]) {
        const roleName = roleMappings[dbMessage.messageType]?.[emoji.name];
        if (!roleName) return;

        const role = message.guild.roles.cache.find(r => r.name === roleName);
        if (role) {
          await member.roles.add(role);
          const reply = await message.channel.send(`${user}, you've been assigned **${role.name}**.`);
          setTimeout(() => reply.delete(), 5000);
        }
        return;
      }

      // If the messageType is for verification, handle ticket creation
      if (dbMessage.messageType === 'verification' && emoji.name === '✅') {
        await createVerificationTicket(member, reaction, user);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  },
};
