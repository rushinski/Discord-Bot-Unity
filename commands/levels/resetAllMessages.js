const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/userSchema');
const levels = require('../../data/levels'); // Import levels data

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('reset-all-messages')
    .setDescription('Reset the levels and message counts of all users in the server.'),
  async execute(interaction) {
    // Ensure the user has the proper permission (e.g., Admin or Manage Guild permissions)
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
      // Fetch all users from the database
      const allUsers = await User.find();

      if (allUsers.length === 0) {
        return interaction.reply({ content: 'There are no users to reset in the database.', ephemeral: true });
      }

      // Reset the message count and level for all users
      for (const user of allUsers) {
        user.messages = 0; // Reset message count
        user.level = levels[0].level; // Reset level to the first level in the levels array
        await user.save();
      }

      // Reply with a success message
      const resetEmbed = new EmbedBuilder()
        .setTitle('🔄 Levels and Messages Reset 🔄')
        .setDescription(`Successfully reset the levels and message counts for **${allUsers.length} users**.`)
        .setColor(0xff0000) // Red color to signify reset
        .setFooter({ text: 'All user levels have been reset to the starting point.' });

      await interaction.reply({ embeds: [resetEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while resetting the levels.', ephemeral: true });
    }
  },
};
