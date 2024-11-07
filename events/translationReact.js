const { EmbedBuilder } = require('discord.js');
const translate = require('@iamtraction/google-translate');

const emojiLanguageMap = {
  '🇬🇧': 'en',
  '🇫🇷': 'fr',
  '🇩🇪': 'de',
  '🇪🇸': 'es',
  '🇬🇷': 'el',
  '🇮🇹': 'it',
  '🇯🇵': 'ja',
  '🇰🇷': 'ko',
  '🇻🇳': 'vi',
  '🇷🇺': 'ru',
};

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const language = emojiLanguageMap[emoji.name];

    if (!language) return;

    try {
      const translated = await translate(message.content, { to: language });
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Translation Successful')
        .addFields(
          { name: 'Original Text:', value: message.content },
          { name: 'Translated Text:', value: translated.text }
        );

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error translating message:', error);
    }
  },
};
