const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hey')
        .setDescription('responds with howdy!'),
    async execute(interaction, client) {
        interaction.reply('Howdy!');
    }
}