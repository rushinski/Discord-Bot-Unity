const { 
  Events, 
  PermissionsBitField, 
  EmbedBuilder, 
  AttachmentBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const Ticket = require('../schemas/ticket');
const TicketTranscript = require('../schemas/ticketTranscript');
const GuildConfig = require('../schemas/config');
const { createWriteStream, unlink } = require('fs');
const path = require('path');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId, channel, guild, member } = interaction;

    const UPPER_SUPPORT_ROLE_ID = '1306333653608960082'; // ID of the Upper Support role
    const VERIFIED_ROLE_ID = '1245564960269144205'; // ID of the Verified role to give
    let ticket;

    // "Ping Support" Button
    if (customId === 'ping-support') {
      const PING_DELAY = 15 * 60 * 1000; // 15 minutes
    
      await interaction.reply({
        content: `<@&${UPPER_SUPPORT_ROLE_ID}> has been pinged for support!`,
        ephemeral: false,
      });
    
      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ping-support')
          .setLabel('Ping Support')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );
    
      await interaction.message.edit({ components: [buttonRow] });

      setTimeout(async () => {
        buttonRow.components[0].setDisabled(false);
        await interaction.message.edit({ components: [buttonRow] });
      }, PING_DELAY);
    }
    
    // "Verify User" Button
    if (customId === 'verify-user') {
      try {
        // Check if the user clicking has the Upper Support Role
        if (!member.roles.cache.has(UPPER_SUPPORT_ROLE_ID)) {
          return interaction.reply({ 
            content: "You don't have permission to verify users.", 
            ephemeral: true 
          });
        }

        // Fetch the ticket from the database
        ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.reply({ content: 'This ticket was not found in the database.', ephemeral: true });
        }

        // Fetch the user who created the ticket
        const ticketOwner = await guild.members.fetch(ticket.userId);
        if (!ticketOwner) {
          return interaction.reply({ content: "Couldn't find the ticket creator in the guild.", ephemeral: true });
        }

        // Assign the "Verified" role to the ticket creator
        await ticketOwner.roles.add(VERIFIED_ROLE_ID);
        await interaction.reply({ content: `${ticketOwner.user.tag} has been verified and given the role.`, ephemeral: true });
      } catch (err) {
        console.error('Error verifying the user:', err);
        await interaction.reply({ content: 'An error occurred while verifying the user.', ephemeral: true });
      }
    }
    
    // "Close Ticket" Button
    if (customId === 'close-ticket') {
      await interaction.deferReply({ ephemeral: true });

      try {
        ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.editReply({ content: 'This ticket was not found in the database.' });
        }

        const messages = await fetchChannelMessages(channel);
        const transcriptFilePath = await saveTranscriptToFile(messages, channel);

        const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
        const transcriptChannelId = guildConfig?.ticketTranscriptsChannel;

        if (transcriptChannelId) {
          const transcriptChannel = guild.channels.cache.get(transcriptChannelId);
          if (transcriptChannel) {
            const attachment = new AttachmentBuilder(transcriptFilePath);
            const embed = new EmbedBuilder()
              .setColor('Blue')
              .setTitle('Ticket Transcript')
              .setDescription(`Transcript of the closed ticket **${channel.name}**.`)
              .setFooter({ text: `Closed by ${member.user.tag}` });

            await transcriptChannel.send({ embeds: [embed], files: [attachment] });
          }
        }

        const ticketOwner = await guild.members.fetch(ticket.userId);
        const attachment = new AttachmentBuilder(transcriptFilePath);
        try {
          await ticketOwner.send({
            content: 'Here is the transcript of your closed ticket. Thank you for reaching out!',
            files: [attachment],
          });
        } catch (err) {
          console.warn(`Unable to DM user (${ticket.userId}):`, err.message);
        }

        ticket.status = 'closed';
        await ticket.save();

        if (!channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.editReply({ content: "I don't have permission to delete this channel." });
        }

        await interaction.editReply({
          content: 'The ticket has been closed, and the transcript has been saved.',
        });
        await channel.delete();

        unlink(transcriptFilePath, (err) => {
          if (err) console.error('Error deleting transcript file:', err);
        });
      } catch (error) {
        console.error('Error closing the ticket:', error);
        await interaction.editReply({
          content: 'An error occurred while closing this ticket.',
        });
      }
    }
  },
};

// Function to fetch all messages from a channel
async function fetchChannelMessages(channel) {
  let messages = [];
  let lastMessageId;

  while (true) {
    const fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
    if (fetchedMessages.size === 0) break;

    messages = messages.concat(Array.from(fetchedMessages.values()));
    lastMessageId = fetchedMessages.lastKey();
  }

  return messages.reverse();
}

// Function to save messages to a text file
async function saveTranscriptToFile(messages, channel) {
  const filePath = path.join(__dirname, `${channel.name}-transcript.txt`);
  const writeStream = createWriteStream(filePath);

  writeStream.write(`Transcript for ${channel.name}\n\n`);
  for (const msg of messages) {
    const timestamp = msg.createdAt.toISOString();
    writeStream.write(`[${timestamp}] ${msg.author.tag}: ${msg.content || '[Embed/Attachment]'}\n`);
  }
  writeStream.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));
  return filePath;
}