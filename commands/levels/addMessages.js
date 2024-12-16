const { recalculateLevel, checkLevelUp } = require('../../utils/levelUtils');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('add-messages')
    .setDescription('Add messages to a user for testing.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to add messages to.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of messages to add.')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({
        content: 'Please provide a valid positive number.',
        ephemeral: true,
      });
    }

    let user = await User.findOne({ userId: target.id });

    if (!user) {
      user = new User({ userId: target.id, messages: 0, level: levels[0].level });
    }

    user.messages += amount;

    // Check if the user has leveled up
    const { hasLeveledUp, message } = checkLevelUp(user, levels);
    await user.save();

    const embedDescription = hasLeveledUp
      ? `${message}\n\nAdded **${amount} messages**. New total: **${user.messages} messages**.`
      : `Added **${amount} messages** to **${target.username}**.\nNew total: **${user.messages} messages**.`;

    const confirmationEmbed = new EmbedBuilder()
      .setTitle(hasLeveledUp ? '🎉 Level Up!' : 'Messages Added')
      .setDescription(embedDescription)
      .setColor(0x3498db)
      .setFooter({ text: `Command executed by ${interaction.user.tag}` });

    return interaction.reply({ embeds: [confirmationEmbed] });
  },
};
