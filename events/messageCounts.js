const fs = require('fs');
const path = require('path');

const messageCountsPath = path.join(__dirname, '../messageCounts.json');
let messageCounts = {};

// Load existing counts if the file exists
if (fs.existsSync(messageCountsPath)) {
  messageCounts = JSON.parse(fs.readFileSync(messageCountsPath, 'utf8'));
}

module.exports = {
  name: 'messageCreate',
  execute(message) {
    if (message.author.bot) return; // Ignore bot messages

    const userId = message.author.id;

    // Increment message count for the user
    if (!messageCounts[userId]) messageCounts[userId] = 0;
    messageCounts[userId]++;

    // For testing, trigger at 10 messages
    if (messageCounts[userId] === 10) {
      message.reply("holy shit you talk alot 😭");
    }

    // Save the updated counts to the file
    fs.writeFileSync(messageCountsPath, JSON.stringify(messageCounts, null, 2));
  },
};
