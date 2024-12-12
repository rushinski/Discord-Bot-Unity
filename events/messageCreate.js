// const { EmbedBuilder } = require('discord.js');
// const User = require('../schemas/userSchema');
// const levels = require('../data/levels'); // Assuming levels are in `data/levels.js`

// module.exports = {
//   name: 'messageCreate',
//   async execute(message) {
//     if (message.author.bot) return;

//     const userId = message.author.id;
//     let user = await User.findOne({ userId });

//     if (!user) {
//       user = new User({ userId, messages: 0, notificationsEnabled: true });
//       await user.save();
//     }

//     user.messages += 1;

//     const nextLevel = levels.find(l => l.messages === user.messages);

//     if (nextLevel) {
//       user.level = nextLevel.level;

//       if (user.notificationsEnabled) {
//         const levelUpEmbed = new EmbedBuilder()
//           .setTitle(`🎉 Level Up!`)
//           .setDescription(`You've reached **${nextLevel.level}**! ${nextLevel.message}`)
//           .setColor(0x00ff00)
//           .setFooter({ text: 'You can disable these notifications using /disable-levelup.' });

//         message.reply({ embeds: [levelUpEmbed] });
//       }
//     }

//     await user.save();
//   },
// };
