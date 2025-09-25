const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help-translation')
        .setDescription('Provides information on using the translation features.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Translation Help')
            .setColor(0xff0000)
            .setDescription("Here's how to use the translation features of the bot.")
            .addFields(
                {
                    name: '1. Reaction Translation',
                    value: `React to any message with a country flag emoji to translate the message into that language.\n**Supported languages:** 🇬🇧, 🇫🇷, 🇩🇪, 🇪🇸, 🇬🇷, 🇮🇹, 🇯🇵, 🇰🇷, 🇻🇳, 🇷🇺, 🇷🇴`,  // Added 🇷🇴 for Romanian
                },
                {
                    name: '2. Slash Command Translation',
                    value: `Use the \`/send-translation\` command to translate a message and send it in a different language.\n**Example:** \`/send-translation language:French text:Hello\``,
                }
            )
            .setFooter({ text: 'Use /help-verify for details on translation.' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
