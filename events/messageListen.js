const User = require('../schemas/userSchema');

const levels = [
  { 
    level: "Lurking Loser", 
    messages: 10, 
    message: "Congrats, you're no longer just breathing in the corner. Maybe try contributing something worthwhile next?" 
  },
  { 
    level: "Wannabe Chatter", 
    messages: 25, 
    message: "Oh, look! Someone's trying to be social. Too bad no one noticed yet." 
  },
  { 
    level: "Keyboard Warrior Intern", 
    messages: 50, 
    message: "You're getting the hang of typing, but let's face it, your words are still meaningless." 
  },
  { 
    level: "Blabbering Buffoon", 
    messages: 100, 
    message: "You’ve hit 100 messages! Too bad most of them are probably nonsense." 
  },
  { 
    level: "Rambling Royal Pain", 
    messages: 200, 
    message: "Wow, 200 messages. Does anyone actually read what you're typing?" 
  },
  { 
    level: "Verbose Attention Seeker", 
    messages: 350, 
    message: "You sure love the sound of your own voice—or, well, your typing. Seek help." 
  },
  { 
    level: "Drama Dumpster Diver", 
    messages: 500, 
    message: "500 messages and counting. You're officially wading knee-deep in irrelevant chatter." 
  },
  { 
    level: "Legendary Oversharer", 
    messages: 750, 
    message: "750 messages? Your life story is now public record. And no one asked for it." 
  },
  { 
    level: "Banter Black Hole", 
    messages: 1000, 
    message: "1,000 messages in. You’ve achieved the rare status of being both everywhere and nowhere at once." 
  },
  { 
    level: "Supreme Yap Tyrant", 
    messages: 1500, 
    message: "Your yap has reached god-tier levels. Do you even have a real life, or is this it for you?" 
  },
];


module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
      await user.save();
    }

    user.messages += 1;

    // Find the next level based on message count
    const nextLevel = levels.find(l => l.messages === user.messages);

    if (nextLevel) {
      user.level = nextLevel.level;
      message.channel.send(
        `<@${userId}>, you've just reached **${nextLevel.level}**! ${nextLevel.message} Keep it up... or maybe take a break?`
      );
          }

    await user.save();
  },
};
