const {
  Events,
  PermissionsBitField,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const Ticket = require('../schemas/ticket');
const GuildConfig = require('../schemas/config');
const { createWriteStream, unlink } = require('fs');
const path = require('path');

const cooldowns = new Map(); // To track ping cooldowns per ticket channel

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId, channel, guild, member } = interaction;

    const UPPER_SUPPORT_ROLE_ID = '1306333653608960082'; // Replace with your support role ID
    const VERIFIED_ROLE_ID = '1245564960269144205'; // Replace with your verified role ID
    const PING_DELAY = 15 * 60 * 1000; // 15 minutes in milliseconds
    let ticket;

    try {
      // Handle "Ping Support" Button
      if (customId === 'ping-support') {
        const now = Date.now();
        const cooldownEnd = cooldowns.get(channel.id) || 0;

        if (now < cooldownEnd) {
          const remainingTime = Math.ceil((cooldownEnd - now) / 60000); // Time left in minutes
          return interaction.reply({
            content: `You cannot ping support yet. Try again in ${remainingTime} minutes.`,
            ephemeral: true,
          });
        }

        // Reset cooldown and ping support role
        cooldowns.set(channel.id, now + PING_DELAY);
        await interaction.reply({
          content: `<@&${UPPER_SUPPORT_ROLE_ID}> has been pinged for assistance.`,
          ephemeral: false,
        });
      }

      // Handle "Verify User" Button
      if (customId === 'verify-user') {
        if (!member.roles.cache.has(UPPER_SUPPORT_ROLE_ID)) {
          return interaction.reply({
            content: "You don't have permission to verify users.",
            ephemeral: true,
          });
        }

        ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.reply({
            content: 'This ticket is not found in the database.',
            ephemeral: true,
          });
        }

        const ticketOwner = await guild.members.fetch(ticket.userId);
        if (!ticketOwner) {
          return interaction.reply({
            content: "Couldn't find the ticket creator in the guild.",
            ephemeral: true,
          });
        }

        // Assign verified role
        await ticketOwner.roles.add(VERIFIED_ROLE_ID);
        await interaction.reply({
          content: `${ticketOwner.user.tag} has been verified and given the verified role.`,
          ephemeral: true,
        });
      }

      // Handle "Close Ticket" Button
      if (customId === 'close-ticket') {
        await interaction.deferReply({ ephemeral: true });
      
        ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.editReply({
            content: 'This ticket is not found in the database.',
          });
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
      
            await transcriptChannel.send({
              embeds: [embed],
              files: [attachment],
            });
          }
        }
      
        let ticketOwner;
        try {
          ticketOwner = await guild.members.fetch(ticket.userId);
        } catch (err) {
          console.warn(`Could not fetch ticket owner (${ticket.userId})`, err.message);
          ticketOwner = null; // Allow processing to continue even if user is not found
        }
      
        if (ticketOwner) {
          const attachment = new AttachmentBuilder(transcriptFilePath);
          try {
            await ticketOwner.send({
              content: 'Here is the transcript of your closed ticket. Thank you for reaching out!',
              files: [attachment],
            });
          } catch (err) {
            console.warn(`Unable to DM user (${ticket.userId}):`, err.message);
          }
        }
      
        ticket.status = 'closed';
        await ticket.save();
      
        if (!channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.editReply({
            content: "I don't have permission to delete this channel.",
          });
        }
      
        await interaction.editReply({
          content: 'The ticket has been closed, and the transcript has been saved.',
        });
        await channel.delete();
      
        unlink(transcriptFilePath, (err) => {
          if (err) console.error('Error deleting transcript file:', err);
        });
      }
    } catch (error) {
      console.error(`Error in button interaction: ${customId}`, error);
      await interaction.reply({
        content: 'An error occurred while handling this action.',
        ephemeral: true,
      });
    }
  },
};

// Function to fetch all messages from a channel
async function fetchChannelMessages(channel) {
  let messages = [];
  let lastMessageId;

  while (true) {
    const fetchedMessages = await channel.messages.fetch({
      limit: 100,
      before: lastMessageId,
    });
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
    writeStream.write(
      `[${timestamp}] ${msg.author.tag}: ${msg.content || '[Embed/Attachment]'}\n`
    );
  }
  writeStream.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));
  return filePath;
}
