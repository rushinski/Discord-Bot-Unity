module.exports = {
  customID: 'say',
  async execute(interaction, client) {
    const message = interaction.fields.getTextInputValue('message');

    // Function to replace @mentions with proper format
    const formatMentions = (text) => {
      // Replace user mentions
      text = text.replace(/@(\d{17,19})/g, (match, userId) => {
        const user = client.users.cache.get(userId);
        return user ? `<@${userId}>` : match;
      });

      // Replace role mentions
      text = text.replace(/@&(\d{17,19})/g, (match, roleId) => {
        const role = interaction.guild.roles.cache.get(roleId);
        return role ? `<@&${roleId}>` : match;
      });

      return text;
    };

    // Format the message content
    const formattedMessage = formatMentions(message);

    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.channel.send(formattedMessage);
      await interaction.deleteReply();
    } catch (error) {
      console.error('Failed to send message:', error);
      await interaction.editReply('Failed to send message - Check if I have permission to send messages in this channel!');
    }
  }
};
