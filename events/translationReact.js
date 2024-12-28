const { EmbedBuilder } = require('discord.js');
const translate = require('@iamtraction/google-translate');

const emojiLanguageMap = {
  // English-Speaking Countries
  '🇬🇧': 'en', // United Kingdom
  '🇺🇸': 'en', // United States
  '🇦🇺': 'en', // Australia
  '🇨🇦': 'en', // Canada
  '🇳🇿': 'en', // New Zealand
  '🇮🇪': 'en', // Ireland

  // European Languages
  '🇫🇷': 'fr', // French
  '🇩🇪': 'de', // German
  '🇪🇸': 'es', // Spanish
  '🇮🇹': 'it', // Italian
  '🇵🇹': 'pt', // Portuguese
  '🇷🇴': 'ro', // Romanian
  '🇳🇱': 'nl', // Dutch
  '🇸🇪': 'sv', // Swedish
  '🇵🇱': 'pl', // Polish
  '🇭🇺': 'hu', // Hungarian
  '🇫🇮': 'fi', // Finnish
  '🇩🇰': 'da', // Danish
  '🇨🇿': 'cs', // Czech
  '🇳🇴': 'no', // Norwegian
  '🇬🇷': 'el', // Greek

  // Asian Languages
  '🇯🇵': 'ja', // Japanese
  '🇰🇷': 'ko', // Korean
  '🇨🇳': 'zh-CN', // Chinese (Simplified)
  '🇹🇼': 'zh-TW', // Chinese (Traditional)
  '🇮🇳': 'hi', // Hindi
  '🇻🇳': 'vi', // Vietnamese
  '🇹🇭': 'th', // Thai
  '🇮🇩': 'id', // Indonesian
  '🇮🇱': 'he', // Hebrew
  '🇵🇭': 'tl', // Filipino (Tagalog)

  // Middle Eastern Languages
  '🇸🇦': 'ar', // Arabic (Saudi Arabia)
  '🇦🇪': 'ar', // Arabic (UAE)

  // Slavic Languages
  '🇷🇺': 'ru', // Russian
  '🇺🇦': 'uk', // Ukrainian
  '🇧🇾': 'be', // Belarusian
  '🇷🇸': 'sr', // Serbian
  '🇧🇬': 'bg', // Bulgarian
  '🇸🇰': 'sk', // Slovak
  '🇸🇮': 'sl', // Slovenian
  '🇭🇷': 'hr', // Croatian
  '🇲🇰': 'mk', // Macedonian

  // African Languages
  '🇿🇦': 'af', // Afrikaans
  '🇳🇬': 'yo', // Yoruba
  '🇰🇪': 'sw', // Swahili
  '🇪🇬': 'ar', // Arabic (Egypt)

  // Additional Languages
  '🇹🇷': 'tr', // Turkish
  '🇧🇷': 'pt', // Portuguese (Brazil)
  '🇲🇽': 'es', // Spanish (Mexico)
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
        .setColor('Blue')
        .setTitle('Translation Successful')
        .addFields(
          { name: 'Original Text:', value: message.content || 'No text provided.' },
          { name: 'Translated Text:', value: translated.text || 'Translation failed.' }
        )
      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error translating message:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Translation Failed')
        .setDescription(
          'An error occurred while attempting to translate the message. Please try again later or contact support.'
        )
      await message.reply({ embeds: [errorEmbed] });
    }
  },
};
