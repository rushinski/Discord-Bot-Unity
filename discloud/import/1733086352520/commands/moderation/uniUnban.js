const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('universal-unban')
    .setDescription('Unbans a user by their Discord ID.')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true)),
  
  async execute(interaction) {
    // Check if the user executing the command has the necessary permissions
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({ 
        content: 'You do not have permission to use this command.', 
        ephemeral: true 
      });
    }

    const userId = interaction.options.getString('userid');

    try {
      // Unban the user by their ID
      await interaction.guild.bans.remove(userId);
      
      // Confirm the unban to the user
      return interaction.reply({ 
        content: `Successfully unbanned the user with ID **${userId}**.`,
        ephemeral: false 
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({ 
        content: `Failed to unban the user with ID **${userId}**. They might not have been banned or I lack permissions.`,
        ephemeral: true 
      });
    }
  },
};
