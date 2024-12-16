const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');
const { recalculateLevel } = require('../../utils/levelUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yap-check')
    .setDescription('Find out how close you are to your next level!'),
  async execute(interaction) {
    const userId = interaction.user.id;

    // Fetch the user from the database
    let user = await User.findOne({ userId });

    if (!user) {
      // User hasn't started their journey yet
      return interaction.reply({
        content: "You haven’t started yapping yet! Send some messages to begin your journey. 🗣️",
        ephemeral: true,
      });
    }

    // Recalculate and update the user's level dynamically
    const previousLevel = user.level;
    recalculateLevel(user, levels);
    await user.save(); // Persist the updated level if it changed

    const currentLevelIndex = levels.findIndex(l => l.level === user.level);
    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1];

    let embedDescription;

    if (!nextLevel) {
      // User is at the highest level
      const progressToMax = user.messages / levels[levels.length - 1].messages;
      const percentageToMax = Math.min(100, Math.floor(progressToMax * 100));

      embedDescription = `You're at the highest level: **${currentLevel.level}**! 🎉 You're a legend among yapper-kind.\n\nYou've achieved **${percentageToMax}%** of the max messages for this system. Truly unstoppable!`;
    } else {
      // Calculate progress towards the next level without revealing its details
      const messagesRequired = nextLevel.messages - currentLevel.messages;
      const progress = (user.messages - currentLevel.messages) / messagesRequired;
      const percentageToNext = Math.min(100, Math.floor(progress * 100));

      embedDescription = `You're currently at **${currentLevel.level}** with **${user.messages} messages**.\n\nYou've completed **${percentageToNext}%** of your progress towards the next goal. Keep yapping to reach the next milestone!`;
    }

    const yapCheckEmbed = new EmbedBuilder()
      .setTitle('Your Yap Progress 📊')
      .setDescription(embedDescription)
      .setColor(0x00ff00) // Green color for the embed
      .setFooter({ text: 'Use /leaderboard to see where you rank against others!' });

    return interaction.reply({ embeds: [yapCheckEmbed] });
  },
};
