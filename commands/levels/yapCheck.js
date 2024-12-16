const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

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

    // Dynamically recalculate the user's current level based on their message count
    const { finalLevel } = getLevelUpMessages(user);
    user.level = finalLevel;
    await user.save(); // Persist the updated level

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
      // Calculate progress towards the next level
      const progressToNext = Math.min(1, user.messages / nextLevel.messages);
      const percentageToNext = Math.floor(progressToNext * 100);

      // Calculate overall progress to the highest level
      const progressToMax = user.messages / levels[levels.length - 1].messages;
      const percentageToMax = Math.min(100, Math.floor(progressToMax * 100));

      embedDescription = `You're currently at **${currentLevel.level}** with **${user.messages} messages**.\n\nYou're **${percentageToNext}%** of the way to your next level (**${nextLevel.level}**, **${nextLevel.messages} messages**).\n\nOverall, you've completed **${percentageToMax}%** of the journey to becoming the ultimate yapper!`;
    }

    const yapCheckEmbed = new EmbedBuilder()
      .setTitle('Your Yap Progress 📊')
      .setDescription(embedDescription)
      .setColor(0x00ff00) // Green color for the embed
      .setFooter({ text: 'Use /leaderboard to see where you rank against others!' });

    return interaction.reply({ embeds: [yapCheckEmbed] });
  },
};

// Utility Function for Dynamic Level Calculation
const getLevelUpMessages = (user) => {
  const levelUpMessages = [];
  let currentLevel = user.level;

  for (const level of levels) {
    if (user.messages >= level.messages && currentLevel < level.level) {
      currentLevel = level.level;
    }
  }

  return {
    messages: levelUpMessages, // Not used here, but available for consistency
    finalLevel: currentLevel,
  };
};
