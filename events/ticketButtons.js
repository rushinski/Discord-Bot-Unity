/**
 * File: events/ticketButtons.js
 * Purpose: Handles ticket-related button interactions.
 *
 * Responsibilities:
 * - Start verification when a user initiates the verification flow.
 * - Allow users to ping support (with cooldowns).
 * - Allow staff to verify users via a ticket.
 * - Close tickets and archive transcripts.
 *
 * Notes for Recruiters:
 * This event listens for button interactions related to the ticket system.
 * It ensures ticket actions such as verification, pinging support, and closure
 * are managed consistently and stored in the database for accountability.
 */

const { Events, EmbedBuilder } = require('discord.js');
const Ticket = require('../schemas/ticket');
const GuildConfig = require('../schemas/config');
const uploadTranscript = require('../utils/githubGistUtils');
const TicketTranscript = require('../schemas/ticketTranscript');
const createVerificationTicket = require('../utils/createVerificationTicket');

const cooldowns = new Map();

module.exports = {
  name: Events.InteractionCreate,

  /**
   * Executes when a button interaction is created.
   * @param {object} interaction - Discord button interaction.
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    try {
      const { customId, channel, guild, member } = interaction;

      const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
      if (!guildConfig) {
        return interaction.reply({
          content:
            'Guild configuration not found. Please configure the ticket system using `/configure-ticket-system`.',
          flags: 64,
        });
      }

      /**
       * Start Verification
       */
      if (customId === 'startVerification') {
        console.log(
          `[TicketSystem] User ${interaction.user.tag} clicked Start Verification in guild ${guild.id}`
        );
        return createVerificationTicket.create({
          interaction,
          targetUser: interaction.user,
        });
      }

      /**
       * Ping Support
       */
      if (customId === 'ping-support') {
        const now = Date.now();
        const cooldownEnd = cooldowns.get(channel.id) || 0;

        if (now < cooldownEnd) {
          const remainingTime = Math.ceil((cooldownEnd - now) / 60000);
          return interaction.reply({
            content: `You cannot ping support yet. Try again in ${remainingTime} minutes.`,
            flags: 64,
          });
        }

        cooldowns.set(channel.id, now + 15 * 60 * 1000); // 15 minutes
        await interaction.reply({
          content: `<@&${guildConfig.generalSupportRoleId}> has been notified for assistance.`,
        });

        console.log(`[TicketSystem] Support pinged in ticket ${channel.id}`);
      }

      /**
       * Verify User (via ticket button)
       */
      if (customId === 'verify-ticket-user') {
        if (!guildConfig.verificationRoleId) {
          return interaction.reply({
            content: 'Verification role not configured. Please set it using `/configure-ticket-system`.',
            flags: 64,
          });
        }

        if (!member.roles.cache.has(guildConfig.generalSupportRoleId)) {
          return interaction.reply({
            content: 'You do not have permission to verify users.',
            flags: 64,
          });
        }

        const ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.reply({
            content: 'This ticket could not be found in the database.',
            flags: 64,
          });
        }

        const ticketOwner = await guild.members
          .fetch(ticket.userId)
          .catch(() => null);

        if (!ticketOwner) {
          return interaction.reply({
            content: 'Unable to locate the ticket creator in this guild.',
            flags: 64,
          });
        }

        await ticketOwner.roles.add(guildConfig.verificationRoleId);
        await interaction.reply({
          content: `${ticketOwner.user.tag} has been verified and granted access.`,
          flags: 64,
        });

        console.log(
          `[TicketSystem] Verified user ${ticketOwner.user.tag} via Verify Button in guild ${guild.id}`
        );
      }

      /**
       * Close Ticket
       */
      if (customId === 'close-ticket') {
        await interaction.deferReply({ flags: 64 });

        const ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.editReply({
            content: 'This ticket could not be found in the database.',
          });
        }

        // Fetch messages for transcript
        const messages = await fetchChannelMessages(channel);

        let transcriptUrl;
        try {
          transcriptUrl = await uploadTranscript(messages, channel, guildConfig);
          if (transcriptUrl) {
            console.log(
              `[TicketSystem] Transcript uploaded for ticket ${channel.id} → ${transcriptUrl}`
            );
          }
        } catch (error) {
          console.error('[TicketSystem] Failed to upload transcript:', error);
          transcriptUrl = null;
        }

        // Save transcript data
        await TicketTranscript.create({
          ticketId: ticket._id,
          gistUrl: transcriptUrl,
          messages: transcriptUrl
            ? []
            : messages.map(msg => ({
                author: msg.author.tag,
                content: msg.content || '[Embed/Attachment]',
                timestamp: msg.createdAt,
              })),
        });

        // Notify transcript channel if configured
        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('Ticket Closed')
          .setDescription(
            `The ticket **${channel.name}** has been closed.\n\n` +
              (transcriptUrl
                ? `[View Transcript](${transcriptUrl})`
                : 'Transcript saved locally.')
          )
          .setFooter({
            text: `Closed by ${member.user.tag}`,
            iconURL: member.user.displayAvatarURL(),
          })
          .setTimestamp();

        if (guildConfig.ticketTranscriptsChannel) {
          const transcriptChannel = guild.channels.cache.get(
            guildConfig.ticketTranscriptsChannel
          );
          if (transcriptChannel) {
            await transcriptChannel.send({ embeds: [embed] });
          }
        }

        ticket.status = 'closed';
        await ticket.save();

        await interaction.editReply({
          content: 'The ticket has been closed and archived.',
        });
        await channel.delete();

        console.log(
          `[TicketSystem] Ticket ${channel.id} closed and archived in guild ${guild.id}`
        );
      }
    } catch (error) {
      console.error('[TicketSystem] Error in ticketButtons handler:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while handling this ticket action.',
          flags: 64,
        });
      }
    }
  },
};

/**
 * Fetches all messages from a channel for transcript purposes.
 * @param {object} channel - Discord text channel.
 * @returns {Array} Array of messages in chronological order.
 */
async function fetchChannelMessages(channel) {
  let messages = [];
  let lastMessageId;

  while (true) {
    const fetched = await channel.messages.fetch({
      limit: 100,
      before: lastMessageId,
    });
    if (fetched.size === 0) break;

    messages = messages.concat(Array.from(fetched.values()));
    lastMessageId = fetched.lastKey();
  }

  return messages.reverse();
}
