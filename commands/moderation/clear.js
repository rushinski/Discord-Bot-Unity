const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Restrict to users with Manage Messages permission
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const channel = interaction.channel;

    try {
      // Check for the 'MANAGE_MESSAGES' permission
      if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({
          content: 'I do not have permission to manage messages in this channel.',
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true }); // Acknowledge the command to avoid timeout

      // Fetch messages and filter out those older than 14 days
      const fetched = await channel.messages.fetch({ limit: amount });
      const deletable = fetched.filter(msg => msg.createdTimestamp > Date.now() - 1209600000); // 14 days in milliseconds

      if (deletable.size === 0) {
        return interaction.editReply('No messages could be deleted (messages may be older than 14 days).');
      }

      await channel.bulkDelete(deletable, true);

      await interaction.editReply(`Successfully deleted ${deletable.size} message(s).`);
    } catch (error) {
      console.error('Error executing clear command:', error);
      return interaction.editReply({
        content: `An error occurred while trying to clear messages: ${error.message}`,
      });
    }
  },
};
