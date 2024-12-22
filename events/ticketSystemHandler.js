const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js');
const TicketTranscript = require('../schemas/ticketTranscript');
const GuildConfig = require('../schemas/config');
const Ticket = require('../schemas/ticket');

const UPPER_TICKET_SUPPORT_ROLE = '1306333653608960082';
const GENERAL_SUPPORT_ROLE = '1306333607018893322';
const pingCooldown = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticketType') {
      interaction.client.userSelectedTicketType = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId('ticketDescriptionModal')
        .setTitle('Describe Your Issue');

      const descriptionInput = new TextInputBuilder()
        .setCustomId('ticketDescription')
        .setLabel('Please describe your issue:')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Provide as much detail as possible.')
        .setRequired(true);

      const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
      modal.addComponents(descriptionRow);

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ticketDescriptionModal') {
      const ticketType = interaction.client.userSelectedTicketType;

      // Check if the user already has an open ticket in the database
      const existingTicket = await Ticket.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        status: { $ne: 'closed' }, // Only consider tickets that are not closed
      });
      
      if (existingTicket) {
        return interaction.reply({
          content: 'You already have an open ticket. Please close it before creating a new one.',
          ephemeral: true,
        });
      }

      const ticketDescription = interaction.fields.getTextInputValue('ticketDescription');

      const permissions = [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: UPPER_TICKET_SUPPORT_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ];

      if (ticketType === 'rss_sellers') {
        permissions.push({
          id: UPPER_TICKET_SUPPORT_ROLE,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        });
      } else if (ticketType !== 'application') {
        permissions.push({
          id: GENERAL_SUPPORT_ROLE,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        });
      }

      let guildConfig;
      try {
        guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!guildConfig || !guildConfig.createdTicketCategory || !guildConfig.ticketTranscriptsChannel) {
          return interaction.reply({
            content:
              'The ticket system is not properly configured. Please ask an administrator to use the `/set` command to configure the ticket category and transcript channels.',
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error('Error fetching guild config:', error);
        return interaction.reply({
          content: 'There was an issue fetching the guild configuration. Please try again later.',
          ephemeral: true,
        });
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: guildConfig.createdTicketCategory,
        permissionOverwrites: permissions,
      });

      const ticketData = new Ticket({
        userId: interaction.user.id,
        channelId: ticketChannel.id,
        guildId: interaction.guild.id,
        ticketType,
        description: ticketDescription,
      });

      await ticketData.save().catch(console.error);

      const guild = interaction.guild;
      const user = interaction.user; // The user who triggered the interaction
      const member = interaction.guild.members.cache.get(user.id); // Retrieve member info from guild

      const ticketEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle(`${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket`)
      .setDescription(
        `**A new ticket has been opened!**\n\n` +
        `👤 **User Info:**\n` +
        `- **Username:** ${user.tag}\n` +
        `- **Display name:** ${user.displayName}\n` +
        `- **Nickname:** ${member.nickname || 'No nickname'}\n\n` +
        `📝 **Issue Details:**\n` +
        `- **Reason:** ${ticketType}\n` +
        `- **Description:** ${ticketDescription}`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: 'Support Team will assist you shortly.', iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();
    

      const closeButton = new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);  

      const pingSupportButton = new ButtonBuilder()
        .setCustomId('pingSupport')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder().addComponents(pingSupportButton, closeButton);

      const message = await ticketChannel.send({
        content: `${
  ticketType === 'rss_sellers' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` :
  ticketType === 'application' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` : `<@&${GENERAL_SUPPORT_ROLE}>`} | <@${user.id}>`,
        embeds: [ticketEmbed],
        components: [actionRow],
      });

      await message.pin();
      await interaction.reply({ content: `Ticket created! Check ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'pingSupport') {
      const ticketData = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticketData) {
        return interaction.reply({ content: 'No open ticket associated with this channel.', ephemeral: true });
      }

      const now = Date.now();
      const lastPing = pingCooldown.get(interaction.channel.id) || ticketData.createdAt;

      const timeDifference = now - lastPing;

      if (timeDifference < 15 * 60 * 1000) {
        const remainingMinutes = Math.ceil((15 * 60 * 1000 - timeDifference) / 60000);
        return interaction.reply({
          content: `You must wait ${remainingMinutes} minutes before pinging support again.`,
          ephemeral: true,
        });
      }

      pingCooldown.set(interaction.channel.id, now);

      const supportRole = interaction.guild.roles.cache.get(
        ticketData.ticketType === 'rss_sellers' ?
        UPPER_TICKET_SUPPORT_ROLE :
        ticketData.ticketType === 'application' ?
          UPPER_TICKET_SUPPORT_ROLE : GENERAL_SUPPORT_ROLE
      );

      await interaction.reply({ content: 'Support team has been pinged!', ephemeral: true });
      await interaction.channel.send({ content: `<@&${supportRole.id}>` });
    }
  }
}    