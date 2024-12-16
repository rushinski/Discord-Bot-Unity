const { recalculateLevel, checkLevelUp } = require('../../utils/levelUtils');

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('remove-messages')
    .setDescription('Remove messages from a user\'s total.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to modify.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of messages to remove.')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({ 
        content: 'Please specify a positive number of messages to remove.', 
        ephemeral: true,
      });
    }

    let user = await User.findOne({ userId: target.id });

    if (!user) {
      return interaction.reply({ 
        content: `${target.tag} does not have any recorded messages.`, 
        ephemeral: true,
      });
    }

    user.messages = Math.max(0, user.messages - amount);

    // Recalculate level based on new message count
    const { hasLeveledUp, message } = checkLevelUp(user, levels);
    await user.save();

    const embedDescription = hasLeveledUp
      ? `${message}\n\nRemoved **${amount} messages**. New total: **${user.messages} messages**.`
      : `Removed **${amount} messages** from **${target.username}**.\nNew total: **${user.messages} messages**.`;

    const confirmationEmbed = new EmbedBuilder()
      .setTitle(hasLeveledUp ? '📉 Level Change!' : 'Messages Removed')
      .setDescription(embedDescription)
      .setColor(0xe74c3c)
      .setFooter({ text: `Command executed by ${interaction.user.tag}` });

    return interaction.reply({ embeds: [confirmationEmbed] });
  },
};
