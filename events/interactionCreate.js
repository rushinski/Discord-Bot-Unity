const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const TicketTranscript = require('../schemas/ticketTranscript'); // Adjust the path as necessary
const openTickets = new Map(); // Map to store userId and their ticket channel ID

const R4_APPLICATION_SUPPORT_ROLE = '1306333653608960082'; // Replace with your R4 Application Support role ID
const GENERAL_SUPPORT_ROLE = '1306333607018893322'; // Replace with your General Support role ID
const TRANSCRIPT_CHANNEL_ID = '1307946220609605783'; // Replace with your designated transcript channel ID

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
        return interaction.reply({ content: 'You already have an open ticket. Please close it before creating a new one.', ephemeral: true });
      }

      const ticketDescription = interaction.fields.getTextInputValue('ticketDescription');
      const supportRoleId = ticketType === 'application' ? R4_APPLICATION_SUPPORT_ROLE : GENERAL_SUPPORT_ROLE;

      const permissions = [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: supportRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ];

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: '1280301664514867292',
        permissionOverwrites: permissions,
      });

      openTickets.set(interaction.user.id, { channelId: ticketChannel.id, ticketType, description: ticketDescription });

      const ticketEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${ticketType} Ticket`)
        .setDescription(`This ticket was opened by **${interaction.user.tag}** for the following reason:`)
        .addFields(
          { name: 'Ticket Reason', value: `**${ticketType}**`, inline: false },
          { name: 'Requested By', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Support Role', value: `<@&${supportRoleId}>`, inline: false },
          { name: 'Issue Description', value: ticketDescription, inline: false }
        )
        .setFooter({ text: 'Please click the button below when you are done.' })
        .setTimestamp();

      const closeButton = new ButtonBuilder()
        .setCustomId('closeTicket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const closeRow = new ActionRowBuilder().addComponents(closeButton);

      const message = await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [closeRow],
      });

      await message.pin();

      await interaction.reply({ content: `Ticket created! Check ${ticketChannel}`, ephemeral: true });
    }

    // Handle ticket closure
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
      if (interaction.channel && interaction.channel.name.startsWith('ticket-')) {
        await interaction.reply({ content: 'Saving transcript and closing ticket...', ephemeral: true });

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = Array.from(messages.values())
          .reverse()
          .map(msg => ({
            author: msg.author.tag,
            content: msg.content || '[Non-text message]', // Handle empty content
            timestamp: msg.createdAt,
          }))
          .filter(msg => msg.content);

        const ticketDetails = openTickets.get(interaction.user.id);
        if (ticketDetails) {
          const { channelId, ticketType, description } = ticketDetails;
          openTickets.delete(interaction.user.id);

          const transcriptData = new TicketTranscript({
            userId: interaction.user.id,
            username: interaction.user.tag,
            ticketType,
            description,
            messages: transcript,
          });

          try {
            await transcriptData.save();
            console.log('Ticket transcript saved successfully.');
          } catch (err) {
            console.error('Failed to save ticket transcript:', err);
          }

          // Generate a formatted transcript
          const formattedTranscript = transcript.map(msg => {
            const time = msg.timestamp.toLocaleString();
            return `[${time}] ${msg.author}: ${msg.content}`;
          }).join('\n');

          const header = `**Ticket Transcript**\n`
            + `**Ticket Type**: ${ticketType}\n`
            + `**Description**: ${description}\n`
            + `**Created By**: ${interaction.user.tag}\n\n`;

          const fullTranscript = header + formattedTranscript;

          // Send the transcript to the ticket creator
          try {
            await interaction.user.send(`Here is your ticket transcript:\n\n\`\`\`\n${fullTranscript}\n\`\`\``);
            console.log('Transcript sent to the ticket creator.');
          } catch (err) {
            console.error('Failed to DM the user the transcript:', err);
          }

          // Send the transcript to the designated channel
          const transcriptChannel = await interaction.guild.channels.fetch(TRANSCRIPT_CHANNEL_ID);
          if (transcriptChannel) {
            const transcriptMessage = `**Ticket Transcript**\n`
              + `**Ticket Type**: ${ticketType}\n`
              + `**Description**: ${description}\n`
              + `**Created By**: ${interaction.user.tag}\n\n`
              + '```' + formattedTranscript + '```';

            await transcriptChannel.send(transcriptMessage);
            console.log('Transcript sent to the transcript channel.');
          } else {
            console.error('Transcript channel not found.');
          }
        }

        setTimeout(() => interaction.channel.delete().catch(console.error), 3000);
      } else {
        await interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
      }
    }
  },
};
