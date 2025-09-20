/**
 * File: events/ready.js
 * Purpose: Handles the clientReady event, triggered when the bot comes online.
 *
 * Responsibilities:
 * - Set the bot’s initial activity status.
 * - Establish a connection to MongoDB.
 * - Resume any active giveaways from the database.
 * - Restore configured reaction-role messages with their assigned emojis.
 *
 * Notes for Recruiters:
 * This event demonstrates how the bot restores state after restart.
 * Active giveaways and reaction-role setups are preserved across sessions,
 * ensuring continuity for server members without requiring manual reconfiguration.
 */

const { ActivityType, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const RoleReactionMessage = require('../schemas/roleReactionMessage');
const Giveaway = require('../schemas/giveaway');
const config = require('../config.json');

module.exports = {
  name: 'clientReady',
  once: true,

  async execute(client) {
    try {
      // Set bot activity
      client.user.setActivity({
        name: 'Listening to Commands...',
        type: ActivityType.Custom,
      });
      console.log('[System] Bot activity set.');
    } catch (error) {
      console.error('[System] Error setting bot activity:', error);
    }

    // Connect to MongoDB
    try {
      const mongoURL = config.MONGOURL;
      if (!mongoURL) {
        console.error('[Database] MongoDB URL is missing in config.');
        return;
      }

      await mongoose.connect(mongoURL);
      console.log('[Database] Connected to MongoDB.');
    } catch (error) {
      console.error('[Database] Error connecting to MongoDB:', error);
      return;
    }

    // Restore active giveaways
    try {
      const activeGiveaways = await Giveaway.find({});
      for (const giveaway of activeGiveaways) {
        const timeLeft = giveaway.endDate - Date.now();

        if (timeLeft > 0) {
          setTimeout(async () => {
            try {
              const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
              if (!channel) return;

              const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
              if (!message) return;

              const users = await message.reactions.cache.get('🎉')?.users.fetch();
              if (!users) return;

              users.delete(message.author.id); // Exclude bot
              const winners = users.random(giveaway.winnersCount);
              const winnersMention = winners?.map(w => `<@${w.id}>`).join(', ') || 'No winners';

              const endEmbed = new EmbedBuilder()
                .setTitle(`${giveaway.title} Ended`)
                .setDescription(`The giveaway for **${giveaway.prize}** has ended.\nWinners: ${winnersMention}`)
                .setColor('Red')
                .setTimestamp();

              await channel.send({ embeds: [endEmbed] });
              await Giveaway.deleteOne({ messageId: giveaway.messageId });

              console.log(`[GiveawaySystem] Completed giveaway: ${giveaway.title}`);
            } catch (err) {
              console.error('[GiveawaySystem] Error completing giveaway:', err);
            }
          }, timeLeft);
        } else {
          await Giveaway.deleteOne({ messageId: giveaway.messageId });
        }
      }
    } catch (error) {
      console.error('[GiveawaySystem] Error restoring giveaways:', error);
    }

    // Restore reaction-role messages
    try {
      const reactionMessages = await RoleReactionMessage.find({ guildId: { $exists: true } });

      if (!reactionMessages.length) {
        console.log('[RoleSystem] No reaction-role configurations found.');
        return;
      }

      for (const config of reactionMessages) {
        try {
          if (!config.channelId || !config.messageId) {
            console.warn(`[RoleSystem] Skipping category "${config.messageType}" in guild ${config.guildId}: missing channelId or messageId.`);
            continue;
          }

          const channel = await client.channels.fetch(config.channelId).catch(() => null);
          if (!channel) {
            console.warn(`[RoleSystem] Channel ${config.channelId} not found in guild ${config.guildId}.`);
            continue;
          }

          const message = await channel.messages.fetch(config.messageId).catch(() => null);
          if (!message) {
            console.warn(`[RoleSystem] Message ${config.messageId} not found in guild ${config.guildId}.`);
            continue;
          }

          // Ensure all configured emojis are present
          for (const r of config.roles) {
            const alreadyHasReaction = message.reactions.cache.has(r.emoji);
            if (!alreadyHasReaction) {
              try {
                await message.react(r.emoji);
                console.log(`[RoleSystem] Restored emoji ${r.emoji} on message ${message.id} (${config.messageType}).`);
              } catch (err) {
                console.error(`[RoleSystem] Failed to react with ${r.emoji} on message ${message.id}:`, err.message);
              }
            }
          }

          console.log(`[RoleSystem] Restored reaction-role message: ${config.messageType} (${message.id})`);
        } catch (err) {
          console.error(`[RoleSystem] Error restoring message for category "${config.messageType}":`, err);
        }
      }
    } catch (error) {
      console.error('[RoleSystem] Error loading reaction-role messages:', error);
    }
  },
};
