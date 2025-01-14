const { SlashCommandBuilder } = require('discord.js');
const { utcToZonedTime, format } = require('date-fns-tz');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-utc')
    .setDescription('Convert your local time to UTC')
    .addStringOption(option =>
      option
        .setName('country')
        .setDescription('Type your country name (e.g., United_States)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('city')
        .setDescription('Type your city or region name (e.g., New_York)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('The time in your timezone (HH:mm)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('The date in your timezone (YYYY-MM-DD)')
        .setRequired(false),
    ),
  async execute(interaction) {
    const country = interaction.options.getString('country');
    const city = interaction.options.getString('city');
    const time = interaction.options.getString('time');
    const date = interaction.options.getString('date') || format(new Date(), 'yyyy-MM-dd');

    try {
      const localDateTime = new Date(`${date}T${time}:00`);
      if (isNaN(localDateTime.getTime())) {
        return interaction.reply({ content: 'Invalid date or time. Please check your input.', ephemeral: true });
      }

      const utcFormatted = localDateTime.toISOString().replace('T', ' ').split('.')[0] + ' UTC';

      return interaction.reply({
        content: `The UTC time for **${time}** in **${country}/${city}** on **${date}** is:\n**${utcFormatted}**`,
      });
    } catch (error) {
      console.error('Error converting time:', error);
      return interaction.reply({
        content: 'An error occurred while converting time. Please ensure your input is valid.',
        ephemeral: true,
      });
    }
  },
};
  