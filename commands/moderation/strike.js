const { SlashCommandBuilder } = require('discord.js');
const Infractions = require('../../schemas/infractions'); // Path to your infractions schema

module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('strike')
        .setDescription('Gives a user a strike. 3 strikes result in a ban.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to give a strike to')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const guildId = interaction.guild.id;
        const guild = interaction.guild;

        // Check if the bot has permissions to ban members
        if (!guild.members.me.permissions.has('BanMembers')) {
            return interaction.reply({ content: 'I do not have permission to ban members.', ephemeral: true });
        }

        try {
            // Find the infraction document or create a new one if it doesn't exist
            let infraction = await Infractions.findOne({ userId: target.id, guildId });

            if (!infraction) {
                infraction = new Infractions({ userId: target.id, guildId, strikes: 0 });
            }

            // Increment the strike count
            infraction.strikes += 1;
            await infraction.save();

            // Notify the user about their updated strikes
            if (infraction.strikes >= 3) {
                const member = await guild.members.fetch(target.id).catch(() => null);

                if (member) {
                    await member.ban({ reason: 'Accumulated 3 strikes.' });
                    await interaction.reply(`${target.tag} has been banned for accumulating 3 strikes.`);
                } else {
                    await interaction.reply({ content: 'User not found in the server.', ephemeral: true });
                }

                // Reset strikes after banning
                await Infractions.deleteOne({ userId: target.id, guildId });
            } else {
                await interaction.reply(`${target.tag} now has ${infraction.strikes} strike(s).`);
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error processing the strike.', ephemeral: true });
        }
    },
};
