const { SlashCommandBuilder } = require('discord.js');
const { admin } = require('./giveaway');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears a given number of messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),
  async execute(interaction) {
    try {
      const amount = interaction.options.getInteger('amount');
      if (isNaN(amount) || amount <= 0 || amount > 100) {
        return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
      }

      // Ensure the channel is valid
      const channel = interaction.channel;
      if (!channel) {
        return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      }

      // Fetch and delete messages
      const fetched = await channel.messages.fetch({ limit: amount });
      await channel.bulkDelete(fetched);

      return interaction.reply({ content: `Successfully deleted ${amount} messages.`, ephemeral: true });
    } catch (error) {
      console.error('Error executing clear command:', error);
      return interaction.reply({ content: `An error occurred while trying to clear messages: ${error.message}`, ephemeral: true });
    }
  },
};
