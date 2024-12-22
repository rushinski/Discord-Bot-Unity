const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const createVerificationTicket = require('../../utils/createVerificationTicket');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('verify-user')
    .setDescription('Verify a user and place them into the ticket system.')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user to verify')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // Ensure the user has appropriate permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true,
        });
      }

      const targetUser = interaction.options.getUser('target');
      const member = await interaction.guild.members.fetch(targetUser.id);

      if (!member) {
        return interaction.reply({
          content: 'The specified user could not be found in the server.',
          ephemeral: true,
        });
      }

      // Initial reply to acknowledge the command
      await interaction.deferReply({ ephemeral: true });

      // Remove all roles from the user
      const rolesToRemove = member.roles.cache.filter((role) => role.name !== '@everyone');
      await member.roles.remove(rolesToRemove);

      // Notify the user
      await member
        .send(
          `Your roles have been removed, and you have been placed into the verification system. A support ticket will be created for you shortly.`
        )
        .catch(console.error);

      // Create a ticket for the user
      await createVerificationTicket(member, { reply: null }, targetUser);

      // Follow-up response after creating the ticket
      await interaction.followUp({
        content: `The user ${targetUser.tag} has been placed into the verification system.`,
      });
    } catch (error) {
      console.error('Error verifying user:', error);

      // If an error occurs, reply only if no reply was already sent
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while processing the user. Please try again later.',
          ephemeral: true,
        });
      }
    }
  },
};
