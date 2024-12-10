const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../schemas/userSchema');

const levels = [
  { level: "Lurking Loser", messages: 10 },
  { level: "Wannabe Chatter", messages: 25 },
  { level: "Keyboard Warrior Intern", messages: 50 },
  { level: "Blabbering Buffoon", messages: 100 },
  { level: "Rambling Royal Pain", messages: 200 },
  { level: "Verbose Attention Seeker", messages: 350 },
  { level: "Drama Dumpster Diver", messages: 500 },
  { level: "Legendary Oversharer", messages: 750 },
  { level: "Banter Black Hole", messages: 1000 },
  { level: "Supreme Yap Tyrant", messages: 1500 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yap-check')
    .setDescription('Find out how close you are to your next level!'),
  async execute(interaction) {
    const userId = interaction.user.id;
    let user = await User.findOne({ userId });

    if (!user) {
      return interaction.reply("You haven’t started yapping yet! Send some messages to begin your journey. 🗣️");
    }

    const currentLevelIndex = levels.findIndex(l => l.level === user.level);
    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1];

    let embedDescription;

    if (!nextLevel) {
      const progressToMax = user.messages / levels[levels.length - 1].messages;
      const percentage = Math.min(100, Math.floor(progressToMax * 100));

      embedDescription = `You're at the highest level: **${currentLevel.level}**! 🎉 You're a legend among yapper-kind.\n\nYou've achieved **${percentage}%** of the max messages for this system. Truly unstoppable!`;
    } else {
      const progressToNext = Math.min(1, user.messages / nextLevel.messages);
      const percentageToNext = Math.floor(progressToNext * 100);

      const progressToMax = user.messages / levels[levels.length - 1].messages;
      const percentageToMax = Math.min(100, Math.floor(progressToMax * 100));

      embedDescription = `You're currently at **${currentLevel.level}** with **${user.messages} messages**.\n\nYou're **${percentageToNext}% of the way** to your next level.\n\nOverall, you've completed **${percentageToMax}%** of the journey to becoming the ultimate yapper!`;
    }

    const yapCheckEmbed = new EmbedBuilder()
      .setTitle('Your Yap Progress 📊')
      .setDescription(embedDescription)
      .setColor(0x00ff00) // Green
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    await interaction.reply({ embeds: [yapCheckEmbed] });
  },
};
