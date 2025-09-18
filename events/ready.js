const { ActivityType, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');
const Giveaway = require('../schemas/giveaway');
const config = require('../config.json');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    // Set bot activity
    client.user.setActivity({
      name: 'Listening to Commands...',
      type: ActivityType.Custom,
    });

    // Connect to MongoDB
    const mongoURL = config.MONGOURL;
    if (!mongoURL) {
      console.error('MongoDB URL is missing in config.');
      return;
    }

    try {
      await mongoose.connect(mongoURL);
      console.log('Connected to the database!');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      return;
    }

    // Restore Active Giveaways
    try {
      const activeGiveaways = await Giveaway.find();

      for (const giveaway of activeGiveaways) {
        const timeLeft = giveaway.endDate - Date.now();
        if (timeLeft > 0) {
          setTimeout(async () => {
            try {
              const channel = await client.channels.fetch(giveaway.channelId);
              const message = await channel.messages.fetch(giveaway.messageId);
              const users = await message.reactions.cache.get('🎉').users.fetch();
              users.delete(message.author.id); // Exclude bot
              const winners = users.random(giveaway.winnersCount);
              const winnersMention = winners.map(winner => `<@${winner.id}>`).join(', ') || 'No winners';

              const endEmbed = new EmbedBuilder()
                .setTitle(`${giveaway.title} Ended!`)
                .setDescription(`The giveaway for **${giveaway.prize}** has ended!\nWinners: ${winnersMention}`)
                .setColor('Red')
                .setTimestamp();

              channel.send({ embeds: [endEmbed] });
              await Giveaway.deleteOne({ messageId: giveaway.messageId });
            } catch (err) {
              console.error('Error completing a giveaway:', err);
            }
          }, timeLeft);
        } else {
          await Giveaway.deleteOne({ messageId: giveaway.messageId });
        }
      }
    } catch (error) {
      console.error('Error restoring giveaways:', error);
    }

    // Initialize Reaction Messages
    try {
      const reactionMessages = await RoleReactionMessage.find();

      if (!reactionMessages.length) {
        console.log('No reaction messages found in the database.');
        return;
      }

      for (const messageData of reactionMessages) {
        try {
          const channel = await client.channels.fetch(messageData.channelId);
          if (!channel) {
            console.log(`Channel ${messageData.channelId} not found.`);
            continue;
          }

          const message = await channel.messages.fetch(messageData.messageId);
          if (!message) {
            console.log(`Message ${messageData.messageId} not found.`);
            continue;
          }

          console.log(`Reaction message loaded: ${message.id}`);
        } catch (err) {
          console.error(`Error loading reaction message ${messageData.messageId}:`, err);
        }
      }
    } catch (error) {
      console.error('Error loading reaction messages:', error);
    }
  },
};
