const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-role-select')
    .setDescription('Sends all the role selection embeds.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Make the reply ephemeral

    const embedsAndReactions = [
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Where are you from? 🌎')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to where you are from!\n🦁︱**Africa**\n🦅︱**North America**\n🦜︱**South America**\n🐂︱**Europe**\n🐼︱**Asia**\n🐨︱**Oceania**\n🐧︱**Antarctica**`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp(),
        type: 'continent',
        reactions: ['🦁', '🦅', '🦜', '🐂', '🐼', '🐨', '🐧'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('How much money will you potentially spend monthly? 💵')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your potentially monthly spending habits!\n🦐︱**$0**\n🐟︱**$1-200**\n🐬︱**$200-750**\n🦈︱**$750-2000**\n🐋︱**$2000-5000**\n🦑︱**$6000+**`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp(),
        type: 'spender',
        reactions: ['🦐', '🐟', '🐬', '🦈', '🐋', '🦑'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('What troop type will you play as? 🪖')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your troop type!\n⚔️︱**Infantry**\n🐎︱**Cavalry**\n🏹︱**Archers**\n🚜︱**Siege**`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp(),
        type: 'troop',
        reactions: ['⚔️', '🐎', '🏹', '🚜'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('What is your past experience? ⭐')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your past experience!\n🥚︱**Brand New Player**\n🐣︱**No KvK Experience**\n1️⃣︱**KvK1**\n2️⃣︱**KvK2**\n3️⃣︱**KvK3**\n⭐︱**Soc**`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp(),
        type: 'experience',
        reactions: ['🥚', '🐣', '1️⃣', '2️⃣', '3️⃣', '⭐'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Have you jumped before? 🚀')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your past jumping experience!\n✅︱**Jumped Before**\n❌︱**New Jumper**`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp(),
        type: 'jumped',
        reactions: ['✅', '❌'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Would you like to be a booster or sleeper? 💭')
          .setDescription(
            `"React to this embed with the corresponding emoji to select your role! You can choose multiple roles if you'd like. If you're unsure what a **'Sleeper'** or **'Booster'** is, feel free to ask!\n🚀︱**Jumper**\n💤︱**Sleeper**\n💪︱**Booster**`
          )
          .setFooter({ text: 'React to gain roles.' })
          .setTimestamp(),
        type: 'jumperType',
        reactions: ['🚀','💤','💪'],
      },
    ];

    for (const { embed, type, reactions } of embedsAndReactions) {
      // Check if a message with this type exists
      const existingMessage = await RoleReactionMessage.findOne({
        messageType: type,
        guildId: interaction.guild.id,
      });

      // If a message exists, delete it
      if (existingMessage) {
        const channel = await interaction.guild.channels.fetch(existingMessage.channelId);
        if (channel) {
          const oldMessage = await channel.messages.fetch(existingMessage.messageId).catch(() => null);
          if (oldMessage) await oldMessage.delete();
        }

        // Remove from the database
        await RoleReactionMessage.deleteOne({ _id: existingMessage._id });
      }

      // Send the new message
      const message = await interaction.channel.send({ embeds: [embed] });

      // Save the new message to the database
      await RoleReactionMessage.create({
        messageId: message.id,
        messageType: type,
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
      });

      // Add reactions to the message
      for (const reaction of reactions) {
        await message.react(reaction);
      }
    }

    await interaction.editReply('Role selection embeds have been sent and saved!'); // Confirmation is ephemeral
  },
};
