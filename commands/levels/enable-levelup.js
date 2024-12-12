// const { SlashCommandBuilder } = require('discord.js');
// const User = require('../../schemas/userSchema');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('enable-levelup')
//     .setDescription('Enable your level-up notifications.'),
//   async execute(interaction) {
//     const userId = interaction.user.id;
//     let user = await User.findOne({ userId });

//     if (!user) {
//       user = new User({ userId, messages: 0, notificationsEnabled: true });
//       await user.save();
//     } else {
//       user.notificationsEnabled = true;
//       await user.save();
//     }

//     await interaction.reply("Your level-up notifications have been enabled. Keep yapping!");
//   },
// };
