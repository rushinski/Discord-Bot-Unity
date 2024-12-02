const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('id-ban')
    .setDescription('Bans a user by their Discord ID.')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)),
  
  async execute(interaction) {
    // Check if the user executing the command has the necessary permissions
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({ 
        content: 'You do not have permission to use this command.', 
        ephemeral: true 
      });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Ban the user by their ID
      await interaction.guild.members.ban(userId, { reason });
      
      // Confirm the ban to the user
      return interaction.reply({ 
        content: `Successfully banned the user with ID **${userId}** for: ${reason}`, 
        ephemeral: false 
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({ 
        content: `Failed to ban the user with ID **${userId}**. They might not exist or I lack permissions.`, 
        ephemeral: true 
      });
    }
  },
};
