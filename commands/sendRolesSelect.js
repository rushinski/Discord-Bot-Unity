const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');
const mongoose = require('mongoose');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-role-select')
    .setDescription('Sends all the role selection embeds.'),

  async execute(interaction) {
    await interaction.deferReply();

    const embedsAndReactions = [
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Where are you from?')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to where you are from!\n🦁︱**Africa**\n🦅︱**North America**\n🦜︱**South America**\n🐂︱**Europe**\n🐼︱**Asia**\n🐨︱**Oceania**\n🐧︱**Antarctica**`
          ),
        type: 'continent',
        reactions: ['🦁', '🦅', '🦜', '🐂', '🐼', '🐨', '🐧'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('How much money will you potentially spend monthly? 💵')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your potentially monthly spending habits!\n🦐︱**$0**\n🐟︱**$1-150**\n🐬︱**$150-400**\n🦈︱**$400-1000**\n🐋︱**$1000-5000**\n🦑︱**$5000+**`
          ),
        type: 'spender',
        reactions: ['🦐', '🐟', '🐬', '🦈', '🐋', '🦑'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('What gender are you? 🧬')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your gender!\n👦︱**Male**\n👧︱**Female**\n❓︱**Other**`
          ),
        type: 'gender',
        reactions: ['👦', '👧', '❓'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('What troop type will you play as? 🪖')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your troop type!\n⚔️︱**Infantry**\n🐎︱**Cavalry**\n🏹︱**Archers**\n🚜︱**Siege**`
          ),
        type: 'troop',
        reactions: ['⚔️', '🐎', '🏹', '🚜'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('What is your past experience? ⭐')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your past experience!\n🥚︱**Brand New Player**\n🐣︱**No KvK Experience**\n1️⃣︱**KvK1**\n2️⃣︱**KvK2**\n3️⃣︱**KvK3**\n⭐︱**Soc**`
          ),
        type: 'experience',
        reactions: ['🥚', '🐣', '1️⃣', '2️⃣', '3️⃣', '⭐'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Have you jumped before? 🚀')
          .setDescription(
            `React to this embed with the corresponding emoji that relates to your past jumping experience!\n✅︱**Jumped Before**\n❌︱**New Jumper**`
          ),
        type: 'jumped',
        reactions: ['✅', '❌'],
      },
      {
        embed: new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Would you like to be a booster or sleeper? 💭')
          .setDescription(
            `React to this embed with the corresponding emojis if you would like to be either a sleeper, booster, or both. If you are unsure what a [ Sleeper ](https://discord.com/channels/1245050735138308116/1277402678380462080) or [ Booster ](https://discord.com/channels/1245050735138308116/1277402678892167170) is simply click the blue words to learn more. Selecting you want to be a booster does not guarantee you to be a booster.\n💪︱**Booster**\n💤︱**Sleeper**`
          ),
        type: 'jumperType',
        reactions: ['💪', '💤'],
      },
    ];

    for (const { embed, type, reactions } of embedsAndReactions) {
      const message = await interaction.channel.send({ embeds: [embed] });
      
      // Save to database
      await RoleReactionMessage.create({
        messageId: message.id,
        messageType: type,
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
      });

      for (const reaction of reactions) {
        await message.react(reaction);
      }
    }

    await interaction.editReply('Role selection embeds have been sent and saved!');
  },
};

