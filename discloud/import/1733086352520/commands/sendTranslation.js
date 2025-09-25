const { SlashCommandBuilder } = require('discord.js');
const translate = require('@iamtraction/google-translate');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-translation')
    .setDescription('Translate your message and send it in a different language.')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('The language you want to translate to')
        .setRequired(true)
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'French', value: 'fr' },
          { name: 'German', value: 'de' },
          { name: 'Spanish', value: 'es' },
          { name: 'Greek', value: 'el' },
          { name: 'Italian', value: 'it' },
          { name: 'Japanese', value: 'ja' },
          { name: 'Korean', value: 'ko' },
          { name: 'Vietnamese', value: 'vi' },
          { name: 'Russian', value: 'ru' },
          { name: 'Romanian', value: 'ro' },
        ))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text you want to translate')
        .setRequired(true)),

  async execute(interaction) {
    const language = interaction.options.getString('language');
    const text = interaction.options.getString('text');

    try {
      const translated = await translate(text, { to: language });
      await interaction.reply({ content: `Translated message: ${translated.text}`, ephemeral: false });
    } catch (error) {
      console.error('Error translating message:', error);
      await interaction.reply({ content: 'There was an error with the translation.', ephemeral: true });
    }
  },
};
