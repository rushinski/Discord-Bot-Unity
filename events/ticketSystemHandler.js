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

      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket 🎟️`)
        .setDescription(
          `**A new ticket has been opened!**\n\n` +
          `📝 **Reason:** ${ticketType}\n` +
          `👤 **Requested By:** <@${interaction.user.id}>\n` +
          `📢 **Support Role:** ` +
          (ticketType === 'rss_sellers' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` :
           ticketType === 'application' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` : `<@&${GENERAL_SUPPORT_ROLE}>`) +
          `\n\n💬 **Issue Description:**\n${ticketDescription}`
        )
        .setFooter({
          text: 'Click the button below to close the ticket when done.',
        });

      const pingSupportButton = new ButtonBuilder()
        .setCustomId('pingSupport')
        .setLabel('Ping Support')
        .setStyle(ButtonStyle.Primary);

      const closeButton = new ButtonBuilder()
        .setCustomId('closeTicket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const actionRow = new ActionRowBuilder().addComponents(pingSupportButton, closeButton);

      const message = await ticketChannel.send({
        content: `Ticket created! Support team has been notified.\n${
  ticketType === 'rss_sellers' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` :
  ticketType === 'application' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` : `<@&${GENERAL_SUPPORT_ROLE}>`}`,
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

    if (interaction.isButton() && interaction.customId === 'closeTicket') {
      if (interaction.channel && interaction.channel.name.startsWith('ticket-')) {
        const channel = interaction.channel;
    
        await interaction.reply({ content: 'Closing ticket and saving transcript...', ephemeral: true });
    
        let guildConfig;
        try {
          guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
          if (!guildConfig) {
            return interaction.followUp({
              content: 'Guild configuration missing. Please configure the ticket system.',
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error('Error fetching guild config during closeTicket:', error);
          return interaction.followUp({
            content: 'Error accessing guild configuration during ticket closure.',
            ephemeral: true,
          });
        }
    
        const messages = [];
        let lastMessageId = null;
    
        let fetchedMessages;
        do {
          fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
          if (fetchedMessages.size === 0) break;
    
          fetchedMessages.forEach((msg) => {
            messages.push({
              author: msg.author.tag,
              content: msg.content || '[Embed or File]',
              timestamp: msg.createdAt,
            });
          });
    
          lastMessageId = fetchedMessages.last()?.id;
    
        } while (fetchedMessages.size === 100);
    
        const ticketData = await Ticket.findOne({ channelId: channel.id });
        if (!ticketData) {
          return interaction.followUp({
            content: 'No ticket data found for this channel. Transcript may be incomplete.',
            ephemeral: true,
          });
        }
    
        // Save transcript
        const transcript = new TicketTranscript({
          userId: ticketData.userId,
          username: interaction.guild.members.cache.get(ticketData.userId)?.user.tag || 'Unknown',
          ticketType: ticketData.ticketType,
          description: ticketData.description,
          messages,
        });
    
        try {
          await transcript.save();
        } catch (error) {
          console.error('Error saving transcript:', error);
        }
    
        const transcriptChannel = interaction.guild.channels.cache.get(guildConfig.ticketTranscriptsChannel);
        if (!transcriptChannel) {
          return interaction.followUp({
            content: 'Transcript channel missing. Please ensure it is properly configured with `/set` command.',
            ephemeral: true,
          });
        }
    
        const transcriptEmbed = new EmbedBuilder()
          .setColor('DarkBlue')
          .setTitle(`Ticket Transcript: ${channel.name}`)
          .setDescription(`**Ticket Type:** ${ticketData.ticketType}\n**User:** <@${ticketData.userId}>\n`)
          .setFooter({ text: 'Transcript successfully saved.' });
    
        await transcriptChannel.send({ embeds: [transcriptEmbed] });
    
        // Update ticket status in MongoDB
        await Ticket.findOneAndUpdate(
          { channelId: channel.id },
          { status: 'closed' }, // Mark the ticket as closed
          { new: true }
        );
    
        // Optionally delete the ticket document from MongoDB
        // await Ticket.deleteOne({ channelId: channel.id });
    
        await channel.delete();
      }
    }
  }
}    