const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const RoleReactionMessage = require('../schemas/roleReactionMessage');
const Ticket = require('../schemas/ticket');
const GuildConfig = require('../schemas/config');

const UPPER_SUPPORT_ROLE_ID = '1319567279511572491'; // Replace with your upper support role ID

async function createVerificationTicket(member, context, user) {
  try {
    const guild = member.guild;

    // Fetch the verification message ID
    const roleReactionMessage = await RoleReactionMessage.findOne({
      guildId: guild.id,
      messageType: 'verification',
    });

    if (!roleReactionMessage || !roleReactionMessage.messageId) {
      console.error('Verification message not found in RoleReactionMessage.');
      if (context.reply) {
        await context.reply({
          content: 'Verification system is not properly configured. Please contact an administrator.',
          ephemeral: true,
        });
      }
      return;
    }

    // Check for existing ticket
    const existingTicket = await Ticket.findOne({
      userId: user.id,
      guildId: guild.id,
      status: { $ne: 'closed' },
    });

    if (existingTicket) {
      await member
        .send('You already have an open ticket. Please close it before creating a new one.')
        .catch(console.error);

      if (context.reply) {
        await context.reply({
          content: 'This user already has an open ticket.',
          ephemeral: true,
        });
      }
      return;
    }

    // Fetch ticket category
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    if (!guildConfig || !guildConfig.createdTicketCategory) {
      console.error('Ticket category not configured in GuildConfig.');
      if (context.reply) {
        await context.reply({
          content: 'Ticket system is not properly configured. Please contact an administrator.',
          ephemeral: true,
        });
      }
      return;
    }

    const ticketCategoryId = guildConfig.createdTicketCategory;

    // Create the ticket channel with updated permissions
    const permissions = [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // Deny everyone
      { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Allow ticket creator
      { id: UPPER_SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Allow upper support
    ];

    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: ticketCategoryId,
      permissionOverwrites: permissions,
    });

    // Save the ticket to the database
    const ticketData = new Ticket({
      userId: user.id,
      channelId: ticketChannel.id,
      guildId: guild.id,
      ticketType: 'verification',
      description: 'User created a verification ticket.',
    });

    await ticketData.save();

    // Buttons for closing and pinging support
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

    const buttonRow = new ActionRowBuilder().addComponents(pingButton, verifyButton, closeButton);

    // Send embed in the new ticket channel
    const accountCreationDate = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`; // Relative timestamp

    const ticketEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('Verification Ticket')
      .setDescription(
        `**A verification ticket has been created!**\n\n👤 **User Info:**\n- **Username:** ${user.tag}\n- **Display name:** ${user.displayName}\n- **Nickname:** ${
          member.nickname || 'No nickname'
        }\n- **Account Created:** ${accountCreationDate}\n\n🔔 **Verification Support Role has been notified.**`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: 'Support Team will assist you shortly.', iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const sentMessage = await ticketChannel.send({
      content: `<@&${UPPER_SUPPORT_ROLE_ID}> | <@${user.id}>`,
      embeds: [ticketEmbed],
      components: [buttonRow],
    });

    await sentMessage.pin();

    // Notify the user via DM
    await member
      .send(`Your verification ticket has been created: ${ticketChannel}`)
      .catch(console.error);

    if (context.reply) {
      await context.reply({
        content: `Verification ticket created for ${user.tag}.`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Error processing verification ticket:', error);

    if (context.reply) {
      await context.reply({
        content: 'An error occurred while creating the verification ticket. Please try again later.',
        ephemeral: true,
      });
    }
  }
}

module.exports = createVerificationTicket;
