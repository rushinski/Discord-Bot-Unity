const { Collection } = require('discord.js');
const levenshtein = require('fast-levenshtein');
const bannedWords = require('../data/bannedWords'); // Import banned words
const mongoose = require('mongoose');
const Infractions = require('../schemas/infractions'); // Import infractions schema

// Function to check if a word matches a banned word (fuzzy matching)
function isSimilar(word, messageContent, threshold = 0.8) {
  const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
  const normalizedMessage = messageContent.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalize the message

  // Compare the word with the message content using Levenshtein distance
  const distance = levenshtein.get(normalizedWord.toLowerCase(), normalizedMessage.toLowerCase());
  const similarity = 1 - distance / Math.max(normalizedWord.length, normalizedMessage.length); // Calculate similarity percentage

  return similarity >= threshold;
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Ignore bots and system messages
    if (message.author.bot || !message.guild) return;

    // Enhanced word detection using fuzzy matching
    const containsBannedWord = bannedWords.some(word => {
      return isSimilar(word, message.content);
    });
    if (!containsBannedWord) return;

    // Delete the offending message
    await message.delete().catch(() => null);

    const userId = message.author.id;
    const guild = message.guild;

    // Fetch or initialize user's infractions
    let userInfractions = await Infractions.findOne({ userId, guildId: guild.id });
    if (!userInfractions) {
      userInfractions = new Infractions({ userId, guildId: guild.id, strikes: 0 });
    }

    // Increment strikes for the user
    userInfractions.strikes += 1;
    await userInfractions.save();

    // Notify user about their infraction
    await message.channel.send({
      content: `⚠️ <@${userId}>, you said a no no word! This is strike ${userInfractions.strikes}/3.`,
    });

    // Timeout user if they reach 3 strikes
    if (userInfractions.strikes >= 3) {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (member) {
        // Find the "No Media" role
        const noMediaRole = guild.roles.cache.find(role => role.name === 'No Media'); // Replace with your role name

        // Assign the "No Media" role to the user
        if (noMediaRole) {
          await member.roles.add(noMediaRole).catch(() => null);
        }

        // Send a message informing the user of their restriction
        await message.channel.send({
          content: `⛔ <@${userId}>, you have been timed out for 1 hour and restricted from posting media for 24 hours due to repeated use of no no words.`,
        });

        // Apply timeout for 1 hour
        await member.timeout(3600000, 'Used banned words 3 times'); // 1 hour timeout

        // Reset strikes after timeout
        userInfractions.strikes = 0;
        await userInfractions.save();

        // Remove the "No Media" role after 24 hours
        setTimeout(async () => {
          if (member && noMediaRole) {
            await member.roles.remove(noMediaRole).catch(() => null);
            await message.channel.send({
              content: `⏰ <@${userId}>, your restriction on posting media has been lifted after 24 hours.`,
            });
          }
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      }
    }
  },
};
