// const { SlashCommandBuilder } = require('discord.js');
// const User = require('../../schemas/userSchema');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('disable-levelup')
//     .setDescription('Disable your level-up notifications.'),
//   async execute(interaction) {
//     const userId = interaction.user.id;
//     let user = await User.findOne({ userId });

//     if (!user) {
//       user = new User({ userId, messages: 0, notificationsEnabled: false });
//       await user.save();
//     } else {
//       user.notificationsEnabled = false;
//       await user.save();
//     }

//     await interaction.reply("Your level-up notifications have been disabled. Use `/enable-levelup` to turn them back on.");
//   },
// };
