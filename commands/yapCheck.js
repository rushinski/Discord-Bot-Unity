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
      embedDescription = `You're at the highest level: **${currentLevel.level}**! 🎉 You're a legend among yapper-kind.`;
    } else {
      const progress = Math.min(1, user.messages / nextLevel.messages); // Cap at 100%
      const percentage = Math.floor(progress * 100);

      embedDescription = `You're currently at **${currentLevel.level}** with **${user.messages} messages**.\n\nYou're **${percentage}% of the way** to your next level. Keep yapping to see what's next!`;
    }

    const yapCheckEmbed = new EmbedBuilder()
      .setTitle('📊 Your Yap Progress')
      .setDescription(embedDescription)
      .setColor(0x00ff00) // Green
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' })

    await interaction.reply({ embeds: [yapCheckEmbed] });
  },
};
