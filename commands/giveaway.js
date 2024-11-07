// Import required modules
const { EmbedBuilder } = require('discord.js'); // Use EmbedBuilder instead of MessageEmbed
const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms'); // Ensure you have the 'ms' package installed

// Command to start a giveaway
module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway!')
        .addStringOption(option =>
          option.setName('title')
              .setDescription('title of giveaway')
              .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the giveaway (e.g., 1s, 1m, 2h, 3d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('The prize for the giveaway')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Number of winners')
                .setRequired(true)),
    
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const duration = interaction.options.getString('duration');
        const prize = interaction.options.getString('prize');
        const winnersCount = interaction.options.getInteger('winners');

        // Check if the duration is valid
        if (!duration.match(/^\d+[smhd]$/)) {
            return interaction.reply({ content: 'Invalid duration format! Use s (seconds), m (minutes), h (hours), or d (days).', ephemeral: true });
        }

        const giveawayChannel = interaction.channel;

        // Calculate end time
        const endTime = Date.now() + ms(duration);
        const endTimeUTC = new Date(endTime).toUTCString(); // Format the end time in UTC

        // Create a giveaway embed
        const giveawayEmbed = new EmbedBuilder() // Use EmbedBuilder instead of MessageEmbed
            .setTitle(`${title}`)
            .setDescription(`Prize: **${prize}**\nNumber of winners: **${winnersCount}**\nEnds at: **${endTimeUTC}** (UTC)`)
            .setColor('Green')
            .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

        // Send the giveaway message
        const giveawayMessage = await giveawayChannel.send({ embeds: [giveawayEmbed] });

        // React to the message with 🎉
        await giveawayMessage.react('🎉');

        // Reply to the interaction with a confirmation message
        await interaction.reply({ content: 'The giveaway has been started!', ephemeral: true });

        // Set a timeout to end the giveaway
        setTimeout(async () => {
            const users = await giveawayMessage.reactions.cache.get('🎉').users.fetch();
            users.delete(giveawayMessage.author.id); // Remove the bot from the users

            const winners = users.random(winnersCount);
            const winnersMention = winners.map(winner => `<@${winner.id}>`).join(', ') || 'No winners';

            // Announce the winners
            const endEmbed = new EmbedBuilder() // Use EmbedBuilder instead of MessageEmbed
                .setTitle(`${title} Ended!`)
                .setDescription(`The giveaway for **${prize}** has ended!\nWinners: ${winnersMention}`)
                .setColor('Red')
                .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

            giveawayChannel.send({ embeds: [endEmbed] });
        }, ms(duration)); // Use the 'ms' package to convert the duration to milliseconds
    },
};
