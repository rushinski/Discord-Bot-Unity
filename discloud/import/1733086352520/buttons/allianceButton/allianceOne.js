module.exports = {
  customID: '1276952978695127223',
  async execute(interaction, client) {
    try {
      // Handle only button interactions
      if (!interaction.isButton()) return;

      // Defer the reply to give us time to process
      await interaction.deferReply({ ephemeral: true });

      // Get the role based on the custom ID
      const role = interaction.guild.roles.cache.get(interaction.customId);
      if (!role) {
        await interaction.editReply({
          content: "I couldn't find that role",
        });
        return;
      }

      // Check if the member already has the role
      const hasRole = interaction.member.roles.cache.has(role.id);

      if (hasRole) {
        // Remove the role if the member has it
        await interaction.member.roles.remove(role);
        await interaction.editReply(`The role ${role} has been removed.`);
      } else {
        // Add the role if the member doesn't have it
        await interaction.member.roles.add(role);
        await interaction.editReply(`The role ${role} has been added.`);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
    }
  }
};