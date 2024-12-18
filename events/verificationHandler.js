const {
  Events,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');
const Ticket = require('../schemas/ticket');
const GuildConfig = require('../schemas/config');

const UPPER_SUPPORT_ROLE_ID = '1306333653608960082'; // Replace with upper support role ID
const PING_DELAY = 15 * 60 * 1000; // 15 minutes in milliseconds

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    const { message, emoji } = reaction;
    const member = await message.guild.members.fetch(user.id);

    try {
      // Step 1: Fetch the verification message ID
      const roleReactionMessage = await RoleReactionMessage.findOne({
        guildId: message.guild.id,
        messageType: 'verification',
      });

      if (!roleReactionMessage || !roleReactionMessage.messageId) {
        console.error('Verification message not found in RoleReactionMessage.');
        return;
      }

      if (message.id !== roleReactionMessage.messageId || emoji.name !== '✅') return;

      // Step 2: Check for existing ticket
      const existingTicket = await Ticket.findOne({
        userId: user.id,
        guildId: message.guild.id,
        status: { $ne: 'closed' },
      });

      if (existingTicket) {
        return member
          .send('You already have an open ticket. Please close it before creating a new one.')
          .catch(console.error);
      }

      // Step 3: Fetch ticket category
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig || !guildConfig.createdTicketCategory) {
        return member
          .send('Ticket system is not properly configured. Please contact an administrator.')
          .catch(console.error);
      }

      const ticketCategoryId = guildConfig.createdTicketCategory;

      // Step 4: Create the ticket channel with updated permissions
      const permissions = [
        { id: message.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // Deny everyone
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Allow ticket creator
        { id: UPPER_SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Allow upper support
      ];

      const ticketChannel = await message.guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: ticketCategoryId,
        permissionOverwrites: permissions,
      });

      // Step 5: Save the ticket to the database
      const ticketData = new Ticket({
        userId: user.id,
        channelId: ticketChannel.id,
        guildId: message.guild.id,
        ticketType: 'verification',
        description: 'User created a verification ticket via reaction.',
      });

      await ticketData.save();

      // Step 6: Buttons for closing and pinging support
      const closeButton = new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const pingButton = new ButtonBuilder()
        .setCustomId('ping-support')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const verifyButton = new ButtonBuilder()
        .setCustomId('verify-user')
        .setLabel('Verify User')
        .setStyle(ButtonStyle.Success);

      const buttonRow = new ActionRowBuilder().addComponents(closeButton, pingButton, verifyButton);

      // Step 7: Send embed in the new ticket channel
      const accountCreationDate = `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`; // Relative time format
      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Verification Ticket 🎟️')
        .setDescription(
          `**A verification ticket has been created!**\n\n👤 **User Info:**\n- **Username:** ${user.tag}\n- **ID:** ${user.id}\n- **Nickname:** ${
            member.nickname || 'No nickname'
          }\n- **Profile Picture:** [Avatar URL](${user.displayAvatarURL({ dynamic: true })})\n- **Account Created:** ${accountCreationDate}\n\n🔔 **Upper Ticket Support Role has been notified.**\n\nClick the button below to close this ticket when resolved.`
        )
        .setFooter({ text: 'Support Team will assist you shortly.' });

      const sentMessage = await ticketChannel.send({
        content: `<@&${UPPER_SUPPORT_ROLE_ID}>`, // Ping upper support role
        embeds: [ticketEmbed],
        components: [buttonRow],
      });

      await sentMessage.pin();

      // Step 8: Notify the user via DM
      await member
        .send(`Your verification ticket has been created: ${ticketChannel}`)
        .catch(console.error);

      // Additional logic for "Ping Support" and cooldown handled in the interaction handler
    } catch (error) {
      console.error('Error processing verification ticket:', error);
    }
  },
};
