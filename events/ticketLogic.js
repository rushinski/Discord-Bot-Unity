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
const TicketTranscript = require('../schemas/ticketTranscript'); // Adjust the path if necessary
const openTickets = new Map(); // Map to store userId and their ticket data

const UPPER_TICKET_SUPPORT_ROLE = '1306333653608960082'; // Upper Ticket Support Role
const GENERAL_SUPPORT_ROLE = '1306333607018893322'; // General Ticket Support Role
const TRANSCRIPT_CHANNEL_ID = '1307946220609605783'; // Transcript Channel ID
const TICKET_CATEGORY_ID = '1316552990211182642'; // Replace with your ticket category ID

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle ticket type selection
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

    // Handle ticket description modal submission
    if (interaction.isModalSubmit() && interaction.customId === 'ticketDescriptionModal') {
      const ticketType = interaction.client.userSelectedTicketType;

      if (openTickets.has(interaction.user.id)) {
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

      if (ticketType !== 'application') {
        // Allow General Support for non-application tickets
        permissions.push({
          id: GENERAL_SUPPORT_ROLE,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        });
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: permissions,
      });

      openTickets.set(interaction.user.id, {
        channelId: ticketChannel.id,
        ticketType,
        description: ticketDescription,
      });

      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`🎟️ ${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket`)
        .setDescription(
          `**A new ticket has been opened!**\n\n` +
          `📝 **Reason:** ${ticketType}\n` +
          `👤 **Requested By:** <@${interaction.user.id}>\n` +
          `📢 **Support Role:** ${
            ticketType === 'application'
              ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>`
              : `<@&${GENERAL_SUPPORT_ROLE}>`
          }\n\n` +
          `💬 **Issue Description:**\n${ticketDescription}`
        )
        .setFooter({
          text: 'Click the button below to close the ticket when done.\nORDER OF THE CRIMSON MOON 2024 ®',
        });

      const closeButton = new ButtonBuilder()
        .setCustomId('closeTicket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const closeRow = new ActionRowBuilder().addComponents(closeButton);

      const message = await ticketChannel.send({
        content: `Ticket created! Support team has been notified.\n${
          ticketType === 'application' ? `<@&${UPPER_TICKET_SUPPORT_ROLE}>` : `<@&${GENERAL_SUPPORT_ROLE}>`
        }`,
        embeds: [ticketEmbed],
        components: [closeRow],
      });

      await message.pin();

      await interaction.reply({ content: `Ticket created! Check ${ticketChannel}`, ephemeral: true });
    }

    // Handle ticket closure
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
      if (interaction.channel && interaction.channel.name.startsWith('ticket-')) {
        const channel = interaction.channel;

        await interaction.reply({ content: 'Closing ticket and saving transcript...', ephemeral: true });

        // Fetch all messages in the ticket channel
        const messages = [];
        let lastMessageId = null;

        while (true) {
          const fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
          if (fetchedMessages.size === 0) break;

          fetchedMessages.forEach((msg) => {
            messages.push({
              author: msg.author.tag,
              content: msg.content || '[Embed or File]',
              timestamp: msg.createdAt,
            });
          });

          lastMessageId = fetchedMessages.last()?.id;
        }

        // Save transcript to MongoDB
        const ticketData = openTickets.get(interaction.user.id);
        if (ticketData) {
          const transcript = new TicketTranscript({
            userId: interaction.user.id,
            username: interaction.user.tag,
            ticketType: ticketData.ticketType,
            description: ticketData.description,
            messages,
          });

          try {
            await transcript.save();
            console.log('Transcript saved successfully!');
          } catch (error) {
            console.error('Error saving transcript:', error);
          }
        }

        // Save transcript to Discord
        const transcriptChannel = interaction.guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID);
        if (transcriptChannel) {
          const transcriptEmbed = new EmbedBuilder()
            .setColor('DarkBlue')
            .setTitle(`Transcript: ${channel.name}`)
            .setDescription(
              `**Ticket Type:** ${ticketData.ticketType}\n` +
              `**Created By:** <@${interaction.user.id}>\n` +
              `**Description:** ${ticketData.description}`
            )
            .setFooter({ text: 'Transcript generated on' })
            .setTimestamp();

          await transcriptChannel.send({ embeds: [transcriptEmbed] });

          const transcriptText = messages
            .map((msg) => `[${msg.timestamp.toISOString()}] ${msg.author}: ${msg.content}`)
            .join('\n');

          if (transcriptText.length <= 2000) {
            await transcriptChannel.send(`\`\`\`\n${transcriptText}\n\`\`\``);
          } else {
            const transcriptChunks = transcriptText.match(/[\s\S]{1,1990}/g);
            for (const chunk of transcriptChunks) {
              await transcriptChannel.send(`\`\`\`\n${chunk}\n\`\`\``);
            }
          }
        }

        // Delete the ticket channel after saving the transcript
        openTickets.delete(interaction.user.id);
        setTimeout(() => channel.delete().catch(console.error), 3000);
      } else {
        await interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
      }
    }
  },
};
